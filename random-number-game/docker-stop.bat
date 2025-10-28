@echo off
echo ========================================
echo   GUESSCRAFT - ARRET DOCKER
echo ========================================
echo.
echo Arret du conteneur...
echo.

docker-compose stop

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SERVEUR ARRETE AVEC SUCCES !
    echo ========================================
    echo.
) else (
    echo.
    echo ERREUR: L'arret a echoue !
    echo.
)

pause
