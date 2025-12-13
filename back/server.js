require('dotenv').config();
const express = require('express');
const cors = require('cors');

// const (RUTA) = require('./routes/(COLOCAR)');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/api/(RUTA)', (RUTA));

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API PARCIAL'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
});