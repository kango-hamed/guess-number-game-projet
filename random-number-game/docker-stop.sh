#!/bin/bash

echo "========================================"
echo "  GUESSCRAFT - ARRET DOCKER"
echo "========================================"
echo ""
echo "Arret du conteneur..."
echo ""

docker-compose stop

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  SERVEUR ARRETE AVEC SUCCES !"
    echo "========================================"
    echo ""
else
    echo ""
    echo "ERREUR: L'arret a echoue !"
    echo ""
fi
