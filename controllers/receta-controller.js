const mongoose = require('mongoose');
const {validationResult} = require ('express-validator');
const HttpError = require('../models/http-error');

const Servicio = require ('../models/servicio');
const Prestacion = require ('../models/prestacion');
const User = require ('../models/user');
const Receta = require ('../models/receta');
const Persona = require ('../models/persona');
const getRecetasByService =async(req,res,next)=>{
    let recetas;
    let costoTotalSD = 0;
    let costoTotalMSC = 0;
    
    const servicioId = req.params.sid;

    try{
        const fechainicial = req.query.fechainicial;
        const fechafinal = req.query.fechafinal;
        recetas = await Receta.aggregate([
          { $match:{servicio:Number(servicioId), 
            fecha: {$gte: new Date(fechainicial.substring(0,10)),$lte: new Date(fechafinal.substring(0,10))}
            }
          },            
          { $lookup: {
            from: 'personas',
            localField: 'persona',
            foreignField: 'codigoSistema',
            as: 'personaDetalle'
          }},
          {
            $lookup:{
              from: 'prestacions',
              localField: 'medicamentos.medicamento',
              foreignField: 'codigoSistema',
              as: 'medicamentosD'
            }
          },
          {
            $lookup:{
              from:'users',
              localField:'usuario',
              foreignField:'codigoSistema',
              as :'usuarioDetalle'
            }
          }

        ]);
        recetas.forEach(receta => {
          receta.medicamentoCompleto = [];
          receta.medicamentoCostoSD = 0;
          receta.medicamentoCostoMSC = 0;
          for (let i = 0; i< receta.medicamentos.length; i++ ){
            for (let j = 0; j<receta.medicamentosD.length;j++){              
              if (Number(receta.medicamentos[i].medicamento) === Number(receta.medicamentosD[j].codigoSistema)){
                receta.medicamentoCompleto.push({...receta.medicamentos[i], ...receta.medicamentosD[j]})                  
                if (receta.medicamentosD[j].costoSD>0){
                    receta.medicamentoCostoSD = receta.medicamentoCostoSD + receta.medicamentos[i].cantidad * receta.medicamentosD[j].costoSD;                                  
                    costoTotalSD = costoTotalSD + receta.medicamentos[i].cantidad * receta.medicamentosD[j].costoSD;                                  
                }                
                else{
                    receta.medicamentoCostoMSC = receta.medicamentoCostoMSC + receta.medicamentos[i].cantidad * receta.medicamentosD[j].costoMSC;                                  
                    costoTotalMSC = costoTotalMSC + receta.medicamentos[i].cantidad * receta.medicamentosD[j].costoMSC;

                }
                  
              }              
            }            
          }  
        });        
    }catch (err){
        error = new HttpError(
            `No se ha podido encontrar recetas para el servicio. ${err}`,
            500
        )
        console.log (err);
        return next (error)
    }    
    res.json({
      costoTotalSD: costoTotalSD.toFixed(2),
      costoTotalMSC: costoTotalMSC.toFixed(2),
      recetas:recetas.map(receta =>({
      _id:receta._id, 
      fecha: receta.fecha ,
      usuario: receta.usuarioDetalle[0],
      persona:  receta.personaDetalle[0] ? receta.personaDetalle[0]:{},
      medicamentos: receta.medicamentoCompleto.map (medicamento=>({ 
        medicamento:{descripcion: medicamento.descripcion,
                     costoSD: medicamento.costoSD, 
                     costoMSC: medicamento.costoMSC,
                     cantidad: medicamento.cantidad,
                     codigoSistema: medicamento.codigoSistema
                    }})),
      costoSD: receta.medicamentoCostoSD,
      costoMSC: receta.medicamentoCostoMSC            
    }))});
};




const getRecetaById = async (req, res, next) => {
    const recetaId = req.params.rid;
    let receta;

    try {
        //receta = await Receta.findById(recetaId);          
        recetas = await Receta.aggregate([
          { $match:{_id: mongoose.Types.ObjectId(recetaId)}
          },            
          { $lookup: {
            from: 'personas',
            localField: 'persona',
            foreignField: 'codigoSistema',
            as: 'personaDetalle'
          }},
          {
            $lookup:{
              from: 'prestacions',
              localField: 'medicamentos.medicamento',
              foreignField: 'codigoSistema',
              as: 'medicamentosD'
            }
          }

        ]);
        recetas.forEach(receta => {
          receta.medicamentoCompleto = [];
          for (let i = 0; i< receta.medicamentos.length; i++ ){
            for (let j = 0; j<receta.medicamentosD.length;j++){              
              if (Number(receta.medicamentos[i].medicamento) === Number(receta.medicamentosD[j].codigoSistema)){
                receta.medicamentoCompleto.push({...receta.medicamentos[i], ...receta.medicamentosD[j]})  
              }              
            }            
          }  
        });
        
    } catch (err) {
      console.log (err)
      const error = new HttpError(
        'No se ha podido encontrar la receta',
        500
      );    
      return next(error);
    }
    if (!recetas) {
      const error = new HttpError(
        'No se ha podido encontrar la receta',
        404
      );
      return next(error);
    }
    
    const recetaF = recetas[0];   
    //res.json({ receta: receta.toObject({ getters: true }) });
    
    res.json({receta:
      
      {
      _id:recetaF._id, 
      fecha: recetaF.fecha ,
      usuario:{name:'Desconocido'},
      persona:  recetaF.personaDetalle[0] ? recetaF.personaDetalle[0]:{},
      medicamentos: recetaF.medicamentoCompleto.map (medicamento=>({ id: medicamento.codigoSistema+'',
                  cantidad : medicamento.cantidad,
                  medicamento:{descripcion: medicamento.descripcion,
                              costoSD: medicamento.costoSD, 
                              costoMSC: medicamento.costoMSC,
                              cantidad: medicamento.cantidad,
                              codigoSistema: medicamento.codigoSistema                              
                    }})),
      
      
    }})
  };
  
 
  const createReceta = async (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      console.log (errors)
      return next(
        new HttpError('No se ha podido ingresar la receta, revisa que exista un nombre y por lo menos un medicamento.', 422)
      );
    }
    const { servicio, fecha, usuario, medicamentos, persona , desactivado} = req.body;
    const createdReceta = new Receta({
      servicio,
      fecha,
      usuario,
      medicamentos,
      persona, 
      desactivado
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
    console.log (req.body)
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