@echo off
set "CONTAINER_NAME=pzsmp_db"
set "DB_USER=postgres"
set "DB_NAME=pzsmp"

echo ==========================================
echo      RESTAURACAO DE BANCO DE DADOS
echo ==========================================
echo.
echo ATENCAO: Isso ira SUBSTITUIR todos os dados atuais pelos do backup.
echo.

set /p BACKUP_FILE="Arraste o arquivo .sql aqui ou digite o caminho: "

if "%BACKUP_FILE%"=="" goto Error

echo.
echo Restaurando a partir de: %BACKUP_FILE%
echo.
pause

docker exec -i %CONTAINER_NAME% psql -U %DB_USER% -d %DB_NAME% < %BACKUP_FILE%

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCESSO] Banco restaurado!
) else (
    echo.
    echo [ERRO] Falha na restauracao.
)
goto End

:Error
echo Nenhum arquivo selecionado.

:End
pause