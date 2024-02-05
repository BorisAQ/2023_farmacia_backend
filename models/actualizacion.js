const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const actualizacionSchema = new Schema ({
    fechaActualizacion:{
        type: Date, required: true
    }
});

module.exports = mongoose.model('Actualizacion',actualizacionSchema);