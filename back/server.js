require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const estado        = require('./routes/estadoRoute');
const estudiante    = require('./routes/estudianteRoute');
const reaccion      = require('./routes/reaccionRoute');
const reporte       = require('./routes/reporteRoute');
const tipoProblema  = require('./routes/tipo_problemaRoute');
const ubicacion     = require('./routes/ubicacionRoute');
const usuario       = require('./routes/usuarioRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/estado', estado);
app.use('/api/estudiante', estudiante);
app.use('/api/reaccion', reaccion);
app.use('/api/reporte', reporte);
app.use('/api/tipoProblema', tipoProblema);
app.use('/api/ubicacion', ubicacion);
app.use('/api/usuario', usuario);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API PARCIAL'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
});
