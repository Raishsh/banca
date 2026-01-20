@echo off
set "CONTAINER_NAME=pzsmp_db"
set "DB_USER=postgres"
set "DB_NAME=pzsmp"
set "BACKUP_DIR=backups"

:: Cria a pasta se não existir
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Pega a data e hora formatada (YYYY-MM-DD_HH-mm-ss) usando PowerShell (mais seguro)
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'"') do set TIMESTAMP=%%a

set "FILENAME=%BACKUP_DIR%\backup_%TIMESTAMP%.sql"

echo ==========================================
echo Gerando backup: %FILENAME%
echo Aguarde...
echo ==========================================

:: O comando mágico. O -i garante que não haja problemas de terminal
docker exec -i %CONTAINER_NAME% pg_dump -U %DB_USER% -d %DB_NAME% > "%FILENAME%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCESSO] Arquivo gerado com sucesso!
    echo Verifique a pasta %BACKUP_DIR%
) else (
    echo.
    echo [ERRO] Algo deu errado. O codigo de erro foi %ERRORLEVEL%.
)

pause