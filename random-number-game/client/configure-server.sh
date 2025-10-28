#!/bin/bash

echo "========================================"
echo "  CONFIGURATION SERVEUR GUESSCRAFT"
echo "========================================"
echo ""
echo "Ce script va configurer l'URL du serveur"
echo "pour le client."
echo ""

read -p "Entrez l'IP du serveur (ex: 192.168.1.100): " SERVER_IP

if [ -z "$SERVER_IP" ]; then
    echo "Erreur: Vous devez entrer une IP !"
    exit 1
fi

echo ""
echo "Creation du fichier .env..."
echo "VITE_SERVER_URL=ws://$SERVER_IP:8000" > .env

echo ""
echo "========================================"
echo "  CONFIGURATION TERMINEE !"
echo "========================================"
echo ""
echo "Fichier .env cree avec :"
echo "  VITE_SERVER_URL=ws://$SERVER_IP:8000"
echo ""
echo "IMPORTANT: Redemarrez le serveur Vite !"
echo "  1. Arretez-le (Ctrl+C)"
echo "  2. Relancez : npm run dev -- --host"
echo ""
