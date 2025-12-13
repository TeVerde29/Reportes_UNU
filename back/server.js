require('dotenv').config();
const express = require('express');
const cors = require('cors');

const login = require('./routes/usuarioRoutes');
const estudiante = require('./routes/estudianteRoutes')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/login', login);
app.use('/api/estudiante', estudiante)

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API PARCIAL'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
});
