# 🌸 Iris AI

Votre assistante IA personnelle — Chat, Code Expert, Génération d'images.  
**100% gratuit** — Groq API + Pollinations.ai

---

## 🚀 Installation complète (étape par étape)

### 1. Installer Node.js (si pas déjà fait)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # doit afficher v20+
```

### 2. Cloner le projet depuis GitHub
```bash
git clone https://github.com/VOTRE_USERNAME/iris-ai.git
cd iris-ai
```

### 3. Obtenir la clé Groq (GRATUIT)
1. Allez sur https://console.groq.com
2. Créez un compte gratuit
3. Cliquez sur "API Keys" > "Create API Key"
4. Copiez la clé

### 4. Configurer le backend
```bash
cd backend
cp .env.example .env
nano .env
# Remplacez "your_groq_api_key_here" par votre vraie clé Groq
```

### 5. Installer les dépendances
```bash
# Dans le dossier backend
cd backend && npm install

# Dans le dossier frontend  
cd ../frontend && npm install
```

### 6. Lancer Iris AI

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Le site s'ouvre automatiquement sur http://localhost:3000 🎉

---

## 🌐 Exposer sur Internet (avec Ngrok — gratuit)

### Installer Ngrok
```bash
# Télécharger
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin

# Compte gratuit sur https://ngrok.com puis :
ngrok config add-authtoken VOTRE_TOKEN_NGROK
```

### Lancer avec Ngrok
```bash
# D'abord lancer le backend et frontend normalement, puis :
ngrok http 3000
# Ngrok donne une URL publique comme : https://abc123.ngrok.io
```

---

## 📁 Structure du projet
```
iris-ai/
├── backend/
│   ├── server.js       # API Express (proxy Groq + Pollinations)
│   ├── .env            # Vos clés API (ne pas commit !)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx     # Interface principale
│   │   └── App.css     # Styles
│   ├── public/
│   │   └── index.html
│   └── package.json
└── README.md
```

---

## 🔧 Technologies utilisées
| Composant | Technologie | Coût |
|-----------|-------------|------|
| Chat & Code | Groq API (Llama 3.3 70B) | Gratuit |
| Images | Pollinations.ai | Gratuit |
| Frontend | React 18 | Gratuit |
| Backend | Node.js + Express | Gratuit |
| Hébergement | Votre serveur | Gratuit |
| Exposition web | Ngrok | Gratuit |

---

## 🛠️ Commandes utiles
```bash
# Voir les logs du backend
cd backend && npm start

# Build de production (optimisé)
cd frontend && npm run build
# Les fichiers sont dans frontend/build/

# Servir le build avec Express (optionnel)
# Ajouter dans backend/server.js :
# app.use(express.static('../frontend/build'));
```

---

## ⚠️ Sécurité
- Ne jamais committer le fichier `.env`
- Le `.gitignore` est configuré pour l'exclure automatiquement
- La clé Groq est côté backend (jamais exposée au navigateur)
