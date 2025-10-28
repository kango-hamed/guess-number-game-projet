@echo off
echo ========================================
echo   GUESSCRAFT - LOGS DOCKER
echo ========================================
echo.
echo Affichage des logs en temps reel...
echo Appuyez sur Ctrl+C pour quitter
echo.

docker-compose logs -f guesscraft-server
