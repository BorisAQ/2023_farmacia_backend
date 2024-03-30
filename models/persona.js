const mongoose = require('mongoose');
const uniqueValidator = require ('mongoose-unique-validator');
const Schema = mongoose.Schema;

const personaSchema = new Schema ({
    apellidosNombres: {type:String, required:true},
    matricula: {type:String, required:true},
    fechaVigencia: {type:Date, required: true},
    codigoSistema:{type:Number, required: true},
    fechaNacimiento:{type:Date, required:true}

});
personaSchema.plugin (uniqueValidator);
module.exports = mongoose.model('Persona',personaSchema);