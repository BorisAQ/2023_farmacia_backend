
const {validationResult} = require ('express-validator');
const HttpError = require('../models/http-error');
const Actualizacion = require ('../models/actualizacion');


const getActualizacion =async(req,res,next)=>{
    let actualizacion;
    try{
        actualizacion = await Actualizacion.find ();        
    }catch (err){
        error = new HttpError(
            'No se pudo encontrar una ninguna actualizacion',
            500
        )
        return next (error)
    }    
    res.json({actualizacion:actualizacion.map(act =>act.toObject({getters:true}))});
};



const createActualizacion = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
    const { fechaActualizacion} = req.body;
    const createdActualizacion = new Actualizacion({
      fechaActualizacion
    });  
    try {  
      await createdActualizacion.save();            
    } catch (err) {
      const error = new HttpError(
        'Creating prestacion failed, please try again.',
        500
      );
      return next(error);
    }
    res.status(201).json({ actualizacion: createdActualizacion });
  };
  
  const updateActualizacion = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Introduza la fecha de actualización', 422)
      );
    }
    const { fechaActualizacion } = req.body;    
    let actualizacion;
    try {
      actualizacion = await Actualizacion.findOne({});
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not update prestacion.',
        500
      );
      return next(error);
    }  
    actualizacion.fechaActualizacion = fechaActualizacion
    
    try {
      await actualizacion.save();
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not update place.',
        500
      );
      return next(error);
    }
    res.status(200).json({ actualizacion: actualizacion.toObject({ getters: true }) });
  };
  


exports.getActualizacion = getActualizacion;
exports.createActualizacion = createActualizacion;
exports.updateActualizacion = updateActualizacion;