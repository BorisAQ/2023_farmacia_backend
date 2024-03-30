const mongoose = require ('mongoose');
const uniqueValidator = require ('mongoose-unique-validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    descripcion: {type: String, required:true},
    codigoSistema: {type: Number, required:true},
    costoSD: {type:Number, required:true},    
    costoMSC: {type:Number, required:true},    
    servicio :{ type: Number, required: true  },
    desactivado: {type: Boolean, required: true}
});

userSchema.plugin (uniqueValidator);

module.exports = mongoose.model('Prestacion', userSchema);
