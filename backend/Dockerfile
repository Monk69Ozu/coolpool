FROM node:20-alpine
WORKDIR /app

# Backend-Abhängigkeiten installieren
COPY backend/package*.json ./
RUN npm ci --only=production

# Backend-Code
COPY backend/server.js .

# Frontend-Dateien ins public/-Verzeichnis
COPY index.html        ./public/
COPY styles.css        ./public/
COPY app-shell.jsx     ./public/
COPY pages-1.jsx       ./public/
COPY pages-2.jsx       ./public/
COPY hero3d.js         ./public/
COPY fonts/            ./public/fonts/

EXPOSE 3001
CMD ["node", "server.js"]
