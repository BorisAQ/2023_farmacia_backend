
const {validationResult} = require ('express-validator');
const HttpError = require('../models/http-error');
const Servicio = require ('../models/servicio');
const Prestacion = require ('../models/prestacion');

const getServicios =async(req,res,next)=>{
    if (req.userData.rol ===1) {      
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
    }
    return next (new HttpError('Falta de privilegios', 401));    
};




const getServicioById = async (req, res, next) => {
  if (req.userData.rol ===1) {      
    const servicioId = req.params.sid;
    let servicio;
    let prestaciones;
       try {
        servicio = await Servicio.findById(servicioId).populate({path:'usuarios', select:['id', 'name']})          
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
    try{
      prestaciones = await Prestacion.find({'servicio': servicioId});
    }catch(err){
      const error = new HttpError(
        'Algo estuvo mal, no se encontraron prestaciones para el servicio.',
        500
      );    
      return next(error);
    }
    let serv;
    serv = servicio.toObject({ getters: true })
    serv.prestaciones=     prestaciones;        
    res.json({ servicio: serv });
  }else{        
    return next (new HttpError('Falta de privilegios', 401));
  }
};
  
 
const createServicio = async (req, res, next) => {
  if (req.userData.rol ===1) {      
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
  }else{        
    return next (new HttpError('Falta de privilegios', 401));
  }
};
  
const updateServicio = async (req, res, next) => {
  if (req.userData.rol ===1) {      
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
  }else{        
    return next (new HttpError('Falta de privilegios', 401));
  }
};
  
const deleteServicio = async (req, res, next) => {
  if (req.userData.rol ===1) {      
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
  }else{        
    return next (new HttpError('Falta de privilegios', 401));
  }
};
  

  
exports.getServicioById = getServicioById;
exports.getServicios = getServicios;
exports.createServicio = createServicio;
exports.updateServicio = updateServicio;
exports.deleteServicio = deleteServicio;