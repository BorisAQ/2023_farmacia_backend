
const {validationResult} = require ('express-validator');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const HttpError = require('../models/http-error');
const User = require ('../models/user');
const Servicio = require ('../models/servicio');
const Prestacion = require ('../models/prestacion');
const Actualizacion = require ('../models/actualizacion');
const getUsers =async(req,res,next)=>{
    let users;
    try{
        users = await User.find ({},'-password');        
    }catch (err){
        error = new HttpError(
            'Could not find any user, failed please try again later!',
            500
        )
        return next (error)
    }    
    res.json({users:users.map(user =>user.toObject({getters:true}))});
};


const getUsersList =async(req,res,next)=>{
    let users;
    try{
        users = await User.find ({},{name:1,_id:1});        
    }catch (err){
        error = new HttpError(
            'Could not find any user, failed please try again later!',
            500
        )
        return next (error)
    }    
    res.json({users:users.map(user => ({_id:user._id,  name: user.name, id: user._id}))});

    
};

const signup = async (req,res,next)=>{
    
    const errors = validationResult(req);
    if (!errors.isEmpty()){   
       console.log (errors);                 
      return next (
         new HttpError('Invalid inputs passed, please check your data '+ errors.messages , 422)
      );      
    }
    const {name, email, password}=req.body;    
    let existingUser;
    try{
        existingUser = await User.findOne ({email:email});        
    }catch(err){
        const error = new HttpError(
            'Signing up failed, please try again later', 500
        );        
        return next (error);
    }
    if (existingUser){
        const error = new HttpError(
            'User exists already, please login instead.', 422
        );        
        return next (error);
    }
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);    
    } catch (err) {
        const error= new HttpError('Could not create user, please try again.',
            500
        );
        return next(error);
    }    
    const createdUser= new User({
        name, 
        email,        
        password: hashedPassword,
        messages:[]
    });

    try{
        await createdUser.save ()
      }catch (err){
        error = new HttpError(
          'signing Up failed, please try again', 500
        );
        return next (error);
      }
      let token;
      try {
        token = jwt.sign(
            {userId: createdUser.id, email: createdUser.email}, 
            process.env.JWT_KEY, 
            {expiresIn:'1h'});  
      } catch (err) {
        error = new HttpError(
            'signing Up failed, please try again', 500
          );
          return next (error);
      }
      
      res.status (201).json ({userId:createdUser.id, 
            email:createdUser.email,
            token: token
        });
    
}

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
            {userId: existingUser.id, email: existingUser.email}, 
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
        
        servicio = await Servicio.find({usuarios: existingUser.id})
            .select ({"name":1});
    }  catch (err){
        error = new HttpError(
            'El usuario no está asignado a ningún servicio', 500
          );
          return next (error);
    }
    const servicioId= servicio[0].id;
    try{
        prestaciones = await Prestacion.find ({servicio:servicioId});        
    }catch (err){
        error = new HttpError(
        'Could not find any prestacion, failed please try again later!',
        500
        )
        return next (error)
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
    
    
    res.json({
        userId: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        token: token,
        servicio: servicio[0],
        prestaciones: prestaciones? prestaciones.map (prestacion => ({'value':prestacion._id, 'label': prestacion.descripcion, 'costo': prestacion.costo})): null ,
        fechaActualizacionPoblacion: actualizacion.fechaActualizacion

        }

        );
}



exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.getUsersList = getUsersList;