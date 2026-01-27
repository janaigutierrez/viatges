const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Carregar variables d'entorn
dotenv.config();

// Connectar a MongoDB
connectDB();

const app = express();

// Middlewares globals
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://viatges.netlify.app'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imatges estàtiques
app.use('/uploads', express.static('uploads'));

// Ruta de health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/regions', require('./routes/regions'));
app.use('/api/llocs', require('./routes/llocs'));

// Error handler (SEMPRE AL FINAL)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});