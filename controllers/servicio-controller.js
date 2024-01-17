
const {validationResult} = require ('express-validator');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const HttpError = require('../models/http-error')
const Servicio = require ('../models/servicio');


const getServicios =async(req,res,next)=>{
    let servicios;
    try{
        servicios = await Servicio.find ({}).populate({path:'usuarios', select:['id', 'name']});        
    }catch (err){
        error = new HttpError(
            'Could not find any user, failed please try again later!',
            500
        )
        return next (error)
    }    
    res.json({servicios:servicios.map(servicio =>servicio.toObject({getters:true}))});
};




const getServicioById = async (req, res, next) => {
    const servicioId = req.params.sid;
    let servicio;
    try {
        servicio = await Servicio.findById(servicioId).populate({path:'usuarios', select:['id', 'name']});        
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not find a service.',
        500
      );    
      return next(error);
    }
    if (!servicio) {
      const error = new HttpError(
        'Could not find the servicio for the provided id.',
        404
      );
      return next(error);
    }
    res.json({ servicio: servicio.toObject({ getters: true }) });
  };
  
 
  const createServicio = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
    const { name, codigoSistema } = req.body;
    const createdServicio = new Servicio({
      name, 
      codigoSistema      
    });
    
    try {           
      await createdServicio.save();            
    } catch (err) {
      const error = new HttpError(
        'Creating servicio failed, please try again.',
        500
      );
      return next(error);
    }
    res.status(201).json({ servicio: createdServicio });
  };
  
  const updateServicio = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
    const { name, codigoSistema, usuarios } = req.body;
    const servicioId = req.params.sid;
    let servicio;
    try {
      servicio = await Servicio.findById(servicioId);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not update servucui.',
        500
      );
      return next(error);
    }
    
    servicio.name = name;
    servicio.codigoSistema = codigoSistema;
    servicio.usuarios = usuarios;
  
    try {
      await servicio.save();
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not update place.',
        500
      );
      return next(error);
    }
    res.status(200).json({ servicio: servicio.toObject({ getters: true }) });
  };
  
  const deleteServicio = async (req, res, next) => {
    const ServicioId = req.params.sid;
    
    let servicio;
    try {
      servicio = await Servicio.findById(ServicioId);
    } catch (err) {
      const error = new HttpError(
      `Something went wrong, could not delete servicio...`,
        500
      );
      return next(error);
    }
    if (!servicio) {
      const error = new HttpError('Could not fin a service for this id.', 404);
      return next(error);
    }
    
    try {
      await servicio.deleteOne();                
    } catch (err) {    
      const error = new HttpError(
        'Something went wrong, could not delete servicio.!!!',
        500
      );
      return next(error);
    }
    res.status(200).json({ message: 'SErvicio eliminado.' });
  };
  

  
exports.getServicioById = getServicioById;
exports.getServicios = getServicios;
exports.createServicio = createServicio;
exports.updateServicio = updateServicio;
exports.deleteServicio = deleteServicio;