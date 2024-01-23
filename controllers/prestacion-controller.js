const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const Prestacion = require('../models/prestacion');
const Servicio = require('../models/servicio');



const getPrestaciones =async(req,res,next)=>{
    let prestaciones;
    try{
        prestaciones = await Prestacion.find ({});        
    }catch (err){
        error = new HttpError(
            'Could not find any prestacion, failed please try again later!',
            500
        )
        return next (error)
    }    
    res.json({prestaciones:prestaciones.map(prestacion =>prestacion.toObject({getters:true}))});
}


  
  

const getPrestacionById = async (req, res, next) => {
  const prestacionId = req.params.pid;
  let prestacion;
  try {
    prestacion = await Prestacion.findById(prestacionId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a message.',
      500
    );    
    return next(error);
  }
  if (!prestacion) {
    const error = new HttpError(
      'Could not find the prestacion for the provided id.',
      404
    );
    return next(error);
  }
  res.json({ prestacion: Prestacion.toObject({ getters: true }) });
};



const createPrestacion = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { descripcion, codigoSistema, costo , servicio} = req.body;
  const createdPrestacion = new Prestacion({
    descripcion, codigoSistema, costo  , servicio  
  });  
  let servicioClinica;
  try {
    servicioClinica = await Servicio.findById(servicio);
  } catch (err) {
    const error = new HttpError(
      'Creating prestacion failed, please try again.',
      500
    );
    return next(error);
  }
  if (!servicioClinica) {
    const error = new HttpError('Could not find servicio for provided id.', 404);
    return next(error);
  }
  


  try {  
    await createdPrestacion.save();            
  } catch (err) {
    const error = new HttpError(
      'Creating prestacion failed, please try again.',
      500
    );
    return next(error);
  }
  res.status(201).json({ prestacion: createdPrestacion });
};

const updatePrestacion = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { descripcion, codigoSistema, costo } = req.body;
  const prestacionId = req.params.pid;
  let prestacion;
  try {
    prestacion = await Prestacion.findById(prestacionId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update prestacion.',
      500
    );
    return next(error);
  }  
  prestacion.descripcion = descripcion;
  prestacion.codigoSistema = codigoSistema;
  prestacion.costo = costo;

  try {
    await prestacion.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }
  res.status(200).json({ prestacion: prestacion.toObject({ getters: true }) });
};

const deletePrestacion = async (req, res, next) => {
  const prestacionId = req.params.pid;
  let prestacion;
  try {
    prestacion = await Prestacion.findById(prestacionId);
  } catch (err) {
    const error = new HttpError(
    `Something went wrong, could not delete message...`,
      500
    );
    return next(error);
  }
  if (!prestacion) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }  
  try {
    await prestacion.deleteOne();                
  } catch (err) {    
    const error = new HttpError(
      'Something went wrong, could not delete prestacion.!!!',
      500
    );
    return next(error);
  }
  res.status(200).json({ prestacion: 'Deleted prestacion.' });
};

exports.getPrestacionById = getPrestacionById;
exports.createPrestacion = createPrestacion;
exports.updatePrestacion = updatePrestacion;
exports.deletePrestacion = deletePrestacion;
exports.getPrestaciones = getPrestaciones;