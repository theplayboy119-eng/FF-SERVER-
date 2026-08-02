# Image de base Node.js officielle et légère
FROM node:18-alpine

# Installation des outils système nécessaires pour la compilation des modules natifs (ex: sqlite3)
RUN apk add --no-cache python3 make g++

# Définition du répertoire de travail dans le conteneur
WORKDIR /app

# Copie des fichiers de configuration des dépendances npm
COPY package*.json ./

# Installation des dépendances de production
RUN npm install --only=production

# Copie de l'ensemble du code source du serveur backend
COPY . .

# Création du dossier pour la base de données si nécessaire
RUN mkdir -p /app/data

# Exposition du port HTTP configuré pour l'API
EXPOSE 3000

# Définition des variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Commande d'exécution du serveur backend Free Fire
CMD ["node", "src/server.js"]
