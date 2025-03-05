'use strict';

let express = require('express');
let mongoose = require('mongoose'); 
let bodyParser = require('body-parser');
let app = express();

//Parse
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json()); // Para aceptar JSON en las solicitudes


//env
require('dotenv').config();  // Carga las variables de entorno
let port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public/'));

app.set('view engine', 'ejs'),
    app.set('views', __dirname + '/views/');

app.use('/futbolistas', require('./router/futbolistas'));
app.get('/', (req, res) => {
    res.redirect('/futbolistas'); // Redirige a la página de futbolistas automáticamente
});

// Configuración de MongoDB
const USER = 'RoGoLo-05';
const PASSWORD = 'RPYo5PJc1MgeRaIQ';
const DBNAME = 'futbolistas';

const uri = `mongodb+srv://${USER}:${PASSWORD}@cluster0.pxzjg.mongodb.net/${DBNAME}?retryWrites=true&w=majority&appName=Cluster0`;

//const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.pxzjg.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(uri) 
    .then(() => console.log('Base de datos conectada')) 
    .catch(e => console.log(e));

app.use((req, res) => {
    res.status(404).render('404', {
        titulo: "Error 404",
        descripcion: "Page Not Found"
    });
})
    .listen(port);

console.log(`Iniciando Express en el puerto ${port} :)`);
