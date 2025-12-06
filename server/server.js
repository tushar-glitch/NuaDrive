const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');

const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'Nua File Share API is running' });
});

const startServer = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL Database');
        connection.release();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

startServer();
