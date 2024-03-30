
const {validationResult} = require ('express-validator');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const HttpError = require('../models/http-error');
const User = require ('../models/user');

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


const getUsersById =async(req,res,next)=>{
    const usuarioId = req.params.uid;    
    let usuario;    
    try {
        usuario= await User.findById(usuarioId);          
    } catch (err) {
      const error = new HttpError(
        'No se ha podido encontrar el usuario',
        500
      );    
      return next(error);
    }
    if (!usuario) {
      const error = new HttpError(
        'No se ha podido encontrar el usuario',
        404
      );
      return next(error);
    }           
    res.json({ usuario: usuario.toObject({ getters: true }) });  
};


const updateUsuario = async (req, res, next) => {
    const errors = validationResult(req);
    const usuarioId = req.params.uid;
    if (!errors.isEmpty()){       
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
    let usuario;
    try {
        usuario = await User.findById(usuarioId);
    } catch (err) {
        const error = new HttpError(
          'Something went wrong, could not update usuario.',
          500
        );
        return next(error);
    }
    usuario.name = name;
    usuario.email = email;
    usuario.password = hashedPassword;
    try {
        await usuario.save();
    } catch (err) {
        const error = new HttpError(
          'Something went wrong, could not update place.',
          500
        );
        return next(error);
    }
    res.status(200).json({ usuario: usuario.toObject({ getters: true }) });
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



exports.getUsers = getUsers;
exports.signup = signup;
exports.getUsersList = getUsersList;
exports.getUsersById = getUsersById;
exports.updateUsuario = updateUsuario;