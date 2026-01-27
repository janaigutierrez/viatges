# Viatges del Pare

Web per documentar viatges per Espanya amb gestió de regions, llocs i punts d'interès.

## Tecnologies

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Base de dades**: MongoDB Atlas
- **Autenticació**: JWT + bcrypt
- **Gestió d'imatges**: Cloudinary

## Instal·lació local

### Backend
```bash
cd server
npm install
cp .env.example .env
# Omple les variables al .env
npm run dev
```

### Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Deploy

- **Frontend**: Netlify
- **Backend**: Render
- **BD**: MongoDB Atlas