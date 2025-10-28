#!/bin/bash

echo "========================================"
echo "  GUESSCRAFT - DEMARRAGE DOCKER"
echo "========================================"
echo ""
echo "Construction et demarrage du conteneur..."
echo ""

docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  SERVEUR DEMARRE AVEC SUCCES !"
    echo "========================================"
    echo ""
    echo "Serveur accessible sur: http://localhost:8000"
    echo ""
    echo "Commandes utiles:"
    echo "  - Voir les logs:     docker-compose logs -f"
    echo "  - Arreter:           docker-compose stop"
    echo "  - Redemarrer:        docker-compose restart"
    echo "  - Supprimer:         docker-compose down"
    echo ""
    echo "Appuyez sur Entree pour voir les logs..."
    read
    docker-compose logs -f
else
    echo ""
    echo "ERREUR: Le demarrage a echoue !"
    echo "Verifiez que Docker est lance."
    echo ""
fi
