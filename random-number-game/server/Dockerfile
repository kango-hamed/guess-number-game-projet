# Utiliser une image Python officielle comme base
FROM python:3.11-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier requirements.txt
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le code du serveur
COPY . .

# Exposer le port 8000
EXPOSE 8000

# Variables d'environnement
ENV PYTHONUNBUFFERED=1

# Commande pour démarrer le serveur
CMD ["uvicorn", "main:socket_app", "--host", "0.0.0.0", "--port", "8000"]
