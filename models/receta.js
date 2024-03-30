const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const recetaSchema = new Schema ({
    servicio: {type: Number,  required: true},
    usuario: {type: Number,  required:true},
    fecha:{  type: Date, required: true },
    persona: { type: Number, required: true   },
    medicamentos:[{
        cantidad: { type: Number, required: true},
        medicamento: { type: Number, required:true}
    }],
    desactivado: {type: Boolean, required: true}
});

module.exports = mongoose.model('Receta',recetaSchema);