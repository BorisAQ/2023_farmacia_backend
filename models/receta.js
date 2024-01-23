const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const recetaSchema = new Schema ({
    servicio: {type: mongoose.Types.ObjectId, ref:'Servicio', required: true},
    usuario: {type: mongoose.Types.ObjectId, ref :'User', required:true},
    fecha:{
        type: Date, required: true
    },
    persona: {
        type: mongoose.Types.ObjectId, 
        required: true,
        ref: 'Persona'
    },
    medicamentos:[{
        cantidad: { type: Number, required: true},
        medicamento: { type: mongoose.Types.ObjectId, ref: 'Prestacion', required:true}
    }]

});

module.exports = mongoose.model('Receta',recetaSchema);