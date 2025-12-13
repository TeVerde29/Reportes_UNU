require('dotenv').config();
const express = require('express');
const cors = require('cors');

const usuario = require('./routes/usuarioRoute');
const estudiante = require('./routes/estudianteRoute');
const tipoProblema = require('./routes/tipo_problemaRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/usuario', usuario);
app.use('/api/estudiante', estudiante);
app.use('/api/tipoProblema', tipoProblema)

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API PARCIAL'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
});
