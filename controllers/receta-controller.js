  
const {validationResult} = require ('express-validator');
const HttpError = require('../models/http-error');

const Servicio = require ('../models/servicio');
const Prestacion = require ('../models/prestacion');
const User = require ('../models/user');
const Receta = require ('../models/receta');

const getRecetasByService =async(req,res,next)=>{
    let recetas;

    const servicioId = req.params.sid;
    try{
      //console.log (req.headers.fechainicial.substring(0,10))    ;
      //console.log (req.headers.fechafinal.substring(0,10))    ;
   
        //recetas = await Receta.find ({servicio:servicioId, fecha: {$gte: new Date(req.headers.fechainicial.substring(0,10)),$lte: new Date(req.headers.fechafinal.substring(0,10))}})
        const fechainicial = req.query.fechainicial;
        const fechafinal = req.query.fechafinal;
        console.log (fechainicial)
        console.log (fechafinal)
        recetas = await Receta.find ({servicio:servicioId, fecha: {$gte: new Date(fechainicial.substring(0,10)),$lte: new Date(fechafinal.substring(0,10))}})
              .populate ({path: 'persona', select :['apellidosNombres', 'matricula']})  
              .populate ({path: 'usuario', select : ['name']})
              .populate ({path: 'medicamentos.medicamento', select : ['descripcion','costo']});        
    }catch (err){
        error = new HttpError(
            `No se ha podido encontrar recetas para el servicio. ${err}`,
            500
        )
        return next (error)
    }    
    res.json({recetas:recetas.map(receta =>receta.toObject({getters:true}))});
};




const getRecetaById = async (req, res, next) => {
    const recetaId = req.params.rid;
    let receta;
    
    try {
        receta = await Receta.findById(recetaId)
          .populate ({path: 'persona', select :['apellidosNombres', 'matricula']})  
          .populate ({path: 'usuario', select : ['name']})
          .populate ({path: 'medicamentos.medicamento', select : ['descripcion','costo']});        
    } catch (err) {
      const error = new HttpError(
        'No se ha podido encontrar la receta',
        500
      );    
      return next(error);
    }
    if (!receta) {
      const error = new HttpError(
        'No se ha podido encontrar la receta',
        404
      );
      return next(error);
    }
    
       
    res.json({ receta: receta.toObject({ getters: true }) });
  };
  
 
  const createReceta = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('No se ha podido ingresar la receta, revisa que exista un nombre y por lo menos un medicamento.', 422)
      );
    }
    const { servicio, fecha, usuario, medicamentos, persona } = req.body;
    const createdReceta = new Receta({
      servicio,
      fecha,
      usuario,
      medicamentos,
      persona
    });
    
    try {           
      await createdReceta.save();            
    } catch (err) {
      const error = new HttpError(
        'No se ha podido ingresar la receta, revisa que exista un nombre y por lo menos un medicamento.',
        500
      );
      return next(error);
    }
    res.status(201).json({ receta: createdReceta });
  };
  
  const updateReceta = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
    const { fecha, usuario, medicamentos, persona } = req.body;
    const recetaId = req.params.rid;
    let receta;
    try {
      receta = await Receta.findById(recetaId);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not update servucui.',
        500
      );
      return next(error);
    }
    
    receta.fecha = fecha;
    receta.usuario = usuario;
    receta.medicamentos = medicamentos;
    receta.persona = persona;

    try {
      await receta.save();
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not update place.',
        500
      );
      return next(error);
    }
    res.status(200).json({ receta: receta.toObject({ getters: true }) });
  };
  
  const deleteReceta = async (req, res, next) => {
    const recetaId = req.params.rid;    
    let receta;
    try {
      receta = await Receta.findById(recetaId);
    } catch (err) {
      const error = new HttpError(
      `Error al eliminar la receta`,
        500
      );
      return next(error);
    }
    if (!receta) {
      const error = new HttpError('No se ha encontrado la receta', 404);
      return next(error);
    }
    
    try {
      await receta.deleteOne();                
    } catch (err) {    
      const error = new HttpError(
        'No se pudo eliminar la receta',
        500
      );
      return next(error);
    }
    res.status(200).json({ message: 'Receta eliminada.' });
  };
  

  
exports.getRecetasByService = getRecetasByService;
exports.getRecetaById = getRecetaById;
exports.createReceta = createReceta;
exports.updateReceta = updateReceta;
exports.deleteReceta = deleteReceta;