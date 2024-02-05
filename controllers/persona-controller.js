const {validationResult} = require ('express-validator');
const HttpError = require('../models/http-error');
const Persona = require ('../models/persona');

const getPersonas =async(req,res,next)=>{
    let personas;
    try{
        personas = await Persona.find ({});        
    }catch (err){
        error = new HttpError(
            'Could not find any user, failed please try again later!',
            500
        )
        return next (error)
    }    

    res.json({personas: personas.map(persona =>persona.toObject({getters:true}))});
};
 

const getPersonasFilterName =async(req,res,next)=>{

  const expresion = req.params.expresion;
  let personas;
  try{
      personas = await Persona.find ({apellidosNombres: new RegExp (expresion, 'i')});        
  }catch (err){
      error = new HttpError(
          'Could not find any user, failed please try again later!',
          500
      )
      return next (error)
  }    

  res.json({personas: personas.map(persona =>persona.toObject({getters:true}))});
};

  const createPersona = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
    const { apellidosNombres, matricula, fechaVigencia, codigoSistema } = req.body;
    
    const createdPersona = new Persona({
      apellidosNombres,
      matricula, 
      fechaVigencia,       
      codigoSistema      
    });
    console.log (createdPersona);
    try {           
      await createdPersona.save();            
    } catch (err) {
      const error = new HttpError(
        'Creating servicio failed, please try again.',
        500
      );
      return next(error);
    }
    res.status(201).json({ persona: createdPersona });
  };
exports.getPersonas = getPersonas;
exports.createPersona = createPersona;
exports.getPersonasFilterName = getPersonasFilterName;