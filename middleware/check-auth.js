const jwt = require ('jsonwebtoken');
const HttpError = require("../models/http-error");

module.exports = (req,res,next)=>{
    if (req.method=== 'OPTIONS'){
        return next ();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];//Authorizatin: 'Bearer TOKEN'    
        if(!token){
            throw error = new HttpError('Authentication failed!',401);
        }
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);        
        req.userData = {
            userId: decodedToken.userId,
            rol: decodedToken.rol
        }        
        next ();
    } catch (err) {
        const error = new HttpError('Authetication failed!', 401)        
        return next (error);
    }
    
    

}