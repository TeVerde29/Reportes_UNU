require('dotenv').config();
const express = require('express');
const cors = require('cors');

const estado        = require('./routes/estadoRoute');
const estudiante    = require('./routes/estudianteRoute');
const reporte       = require('./routes/reporteRoute');
const tipoProblema  = require('./routes/tipo_problemaRoute');
const tipoUbicacion = require('./routes/tipo_ubicacionRoute');
const ubicacion     = require('./routes/ubicacionRoute');
const usuario       = require('./routes/usuarioRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/usuario', usuario);
app.use('/api/estudiante', estudiante);
app.use('/api/reporte', reporte);
app.use('/api/estado', estado);
app.use('/api/tipoProblema', tipoProblema);
app.use('/api/tipoUbicacion', tipoUbicacion);
app.use('/api/ubicacion', ubicacion);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API PARCIAL'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
});
