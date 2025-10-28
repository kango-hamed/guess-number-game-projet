@echo off
echo ========================================
echo   CONFIGURATION SERVEUR GUESSCRAFT
echo ========================================
echo.
echo Ce script va configurer l'URL du serveur
echo pour le client.
echo.

:input
set /p SERVER_IP="Entrez l'IP du serveur (ex: 192.168.1.100): "

if "%SERVER_IP%"=="" (
    echo Erreur: Vous devez entrer une IP !
    goto input
)

echo.
echo Creation du fichier .env...
echo VITE_SERVER_URL=ws://%SERVER_IP%:8000 > .env

echo.
echo ========================================
echo   CONFIGURATION TERMINEE !
echo ========================================
echo.
echo Fichier .env cree avec :
echo   VITE_SERVER_URL=ws://%SERVER_IP%:8000
echo.
echo IMPORTANT: Redemarrez le serveur Vite !
echo   1. Arretez-le (Ctrl+C)
echo   2. Relancez : npm run dev -- --host
echo.
pause
