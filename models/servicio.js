const mongoose = require ('mongoose');
const uniqueValidator = require ('mongoose-unique-validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required:true},
    codigoSistema: {type: Number, required:true},
    usuarios: [{type:mongoose.Types.ObjectId, 
        required:true, ref:'User'}]
});

userSchema.plugin (uniqueValidator);

module.exports = mongoose.model('Servicio', userSchema);
