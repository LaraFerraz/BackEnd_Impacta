@echo off
REM Script para iniciar MySQL no Windows via XAMPP
REM Uso: start-mysql.bat

setlocal enabledelayedexpansion

echo.
echo ======================================
echo   INICIADOR MYSQL - XAMPP
echo ======================================
echo.

REM Verificar se MySQL está rodando usando netstat
netstat -ano | findstr ":3306" > nul
if %errorlevel% equ 0 (
    echo [OK] MySQL ja esta rodando na porta 3306!
    exit /b 0
)

echo [INFO] MySQL nao esta rodando. Tentando iniciar...
echo.

REM Tentar iniciar via XAMPP binário
set XAMPP_MYSQL=C:\xampp\mysql\bin\mysqld.exe

if exist "%XAMPP_MYSQL%" (
    echo [EXEC] Iniciando MySQL from: %XAMPP_MYSQL%
    
    REM Executar em background
    start "" "%XAMPP_MYSQL%" --datadir="C:\xampp\mysql\data" --port=3306
    
    REM Aguardar MySQL ficar disponível
    echo [WAIT] Aguardando MySQL iniciar (max 15 segundos)...
    timeout /t 3 /nobreak
    
    setlocal enabledelayedexpansion
    for /l %%i in (1,1,15) do (
        netstat -ano | findstr ":3306" > nul
        if !errorlevel! equ 0 (
            echo [OK] MySQL esta operacional!
            exit /b 0
        )
        timeout /t 1 /nobreak
    )
    
    echo [ERRO] MySQL nao respondeu em tempo
    exit /b 1
) else (
    echo [ERRO] XAMPP MySQL nao encontrado em: %XAMPP_MYSQL%
    echo.
    echo [SOLUCAO] Abra XAMPP Control Panel e clique em 'Start' para MySQL
    echo.
    exit /b 1
)
