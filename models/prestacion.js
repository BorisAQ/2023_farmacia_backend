const mongoose = require ('mongoose');
const uniqueValidator = require ('mongoose-unique-validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    descripcion: {type: String, required:true},
    codigoSistema: {type: Number, required:true},
    costo: {type:Number, required:true},    
    servicio :{
        type: mongoose.Types.ObjectId, 
        required: true, ref:'Servicio'
    }
});

userSchema.plugin (uniqueValidator);

module.exports = mongoose.model('Prestacion', userSchema);
