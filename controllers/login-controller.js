
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const HttpError = require('../models/http-error');
const User = require ('../models/user');
const Servicio = require ('../models/servicio');
const Prestacion = require ('../models/prestacion');
const Actualizacion = require ('../models/actualizacion');


const login =async (req,res,next)=>{
    const {email, password}= req.body;
    let existingUser;
    try{
        existingUser = await User.findOne ({email:email});        
    }catch(err){
        const error = new HttpError(
            'Loggin failed, please try again later', 500
        );        
        return next (error);
    };
    if (!existingUser ){
        const error = new HttpError ('Invalid credential, could not log you in',401);
        return next(error);
    }
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare (password, existingUser.password);    
    } catch (err) {
        const error = new HttpError('Could not log yo in , please check your credential',
        500);
        return (error);
    }
    if (!isValidPassword){
        const error = new HttpError ('Invalid credential, could not log you in',401);
        return next(error);
    }
    let token;
      try {        
        token = jwt.sign( 
            {userId: existingUser.codigoSistema, email: existingUser.email,rol: existingUser.rol? existingUser.rol:0}, 
            process.env.JWT_KEY, 
            {expiresIn:'1h'});  
      } catch (err) {
        error = new HttpError(
            'loggin in failed, please try again', 500
          );
          return next (error);
      }
    let servicio;    
    try{
        
        servicio = await Servicio.find({codigoSistema: existingUser.servicioId})
            .select ({"name":1, "codigoSistema":1});    
        try{
            prestaciones = await Prestacion.find ({servicio:existingUser.servicioId});        
        }catch (err){
                error = new HttpError(
                'Could not find any prestacion, failed please try again later!',
                500
                )
                return next (error)
        }    
                    
    }  catch (err){
        error = new HttpError(
            'El usuario no está asignado a ningún servicio', 500
          );
          return next (error);
    }
    let actualizacion;
    try{
        actualizacion = await Actualizacion.findOne ({});        
    }catch (err){
        error = new HttpError(
        'Could not find any prestacion, failed please try again later!',
        500
        )
        return next (error)
    }    
    
    console.log(existingUser);  
    console.log(existingUser.codigoSistema);  
    res.json({
        userId: existingUser.codigoSistema,
        name: existingUser.name,
        email: existingUser.email,
        token: token,
        servicio: servicio? servicio[0]: null,
        prestaciones: prestaciones? prestaciones.map (prestacion => ({'value':prestacion.codigoSistema+'', 'label': prestacion.descripcion, 'costo': prestacion.costo})): null ,
        fechaActualizacionPoblacion: actualizacion.fechaActualizacion,
        rol: existingUser.rol ? existingUser.rol : 0
        }

        );
}

exports.login = login;