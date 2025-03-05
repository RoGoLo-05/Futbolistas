'use strict' 
const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

const futbolistasSchema = new Schema ({ 
    id: { type: Number, required: true },
    nombre: { type: String, required: true },
    posicion: { type: String, required: true },
    nacionalidad: { type: String, required: true },
    imagen: {type: String, required: false }
});

//Creamos el modelo 
const Futbolistas = mongoose.model('Futbolistas', futbolistasSchema, "futbolistas");

module.exports = Futbolistas;