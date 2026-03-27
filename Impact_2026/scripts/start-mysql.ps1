#!/usr/bin/env pwsh

<#
 .Description
 Script para iniciar MySQL via XAMPP no Windows
#>

$XAMPP_MYSQL_PATH = 'C:\xampp\mysql\bin\mysqld.exe'
$MYSQL_PORT = 3306
$MAX_WAIT_TIME = 15

function Test-MySQLConnection {
    param([int]$Port = 3306)
    
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.ConnectAsync("localhost", $Port).Wait(1000)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

function Start-MySQLServer {
    Write-Host "🔧 Iniciando MySQL (XAMPP)..." -ForegroundColor Yellow
    
    if (Test-Path $XAMPP_MYSQL_PATH) {
        try {
            # Inicia MySQL em background via powershell job
            $job = Start-Job -ScriptBlock {
                param($path)
                & $path --datadir="C:\xampp\mysql\data" --port=3306
            } -ArgumentList $XAMPP_MYSQL_PATH
            
            Write-Host "✅ Processo MySQL iniciado (Job ID: $($job.Id))" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "❌ Erro ao iniciar MySQL: $_" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "❌ XAMPP MySQL não encontrado em: $XAMPP_MYSQL_PATH" -ForegroundColor Red
        Write-Host "   Inicie manualmente: Abra XAMPP Control Panel e clique em 'Start' para MySQL" -ForegroundColor Yellow
        return $false
    }
}

function Wait-ForMySQL {
    param([int]$MaxWait = 15)
    
    $startTime = Get-Date
    $attempt = 0
    
    while ((New-TimeSpan -Start $startTime -End (Get-Date)).TotalSeconds -lt $MaxWait) {
        $attempt++
        
        if (Test-MySQLConnection -Port $MYSQL_PORT) {
            Write-Host "✅ MySQL está operacional!" -ForegroundColor Green
            return $true
        }
        
        $elapsed = [int](New-TimeSpan -Start $startTime -End (Get-Date)).TotalSeconds
        Write-Host "⏳ Aguardando MySQL... ($elapsed/$MaxWait segundos)" -ForegroundColor Yellow
        Start-Sleep -Seconds 1
    }
    
    Write-Host "❌ Timeout: MySQL não respondeu" -ForegroundColor Red
    return $false
}

# Main
Write-Host "🚀 Verificando MySQL..." -ForegroundColor Cyan

if (Test-MySQLConnection -Port $MYSQL_PORT) {
    Write-Host "✅ MySQL já está rodando!" -ForegroundColor Green
} else {
    Write-Host "⚠️  MySQL não está rodando" -ForegroundColor Yellow
    
    $started = Start-MySQLServer
    
    if ($started) {
        $ready = Wait-ForMySQL -MaxWait $MAX_WAIT_TIME
        
        if (-not $ready) {
            Write-Host "`n❌ MySQL não iniciou a tempo. Tente:" -ForegroundColor Red
            Write-Host "   1. Abra XAMPP Control Panel"
            Write-Host "   2. Clique em 'Start' para MySQL"
            Write-Host "   3. Execute o comando novamente" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "`n❌ Não foi possível iniciar MySQL" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✅ Pronto para sincronizar banco de dados" -ForegroundColor Green
exit 0
