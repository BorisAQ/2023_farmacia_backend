const gv= require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const messagesRoutes = require('./routes/message-routes');
const usersRoutes = require('./routes/user-routes');
const serviciosRoutes = require('./routes/servicio-routes');
const PrestacionRoutes = require('./routes/prestacion-routes');
const PersonaRoutes = require ('./routes/persona-routes');
const RecetaRoutes = require ('./routes/receta-routes');
const UtilitariosRoutes = require ('./routes/utilitarios-routes');
const ActualizacionRoutes = require ('./routes/actualizacion-routes');
const LoginRoutes = require ('./routes/login-routes');
const HttpError = require('./models/http-error');

//  x= require('dotenv').config();

const app = express();



app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', `${process.env.ORIGIN}`);
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});
app.get ("/", (req,res)=>{
  const htmlResponse =`<html><head></head><body><h1>Hola Mundo1</h1></body></html>`
  res.send (htmlResponse);
});


app.use('/api/login', LoginRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/users', usersRoutes);
app.use ('/api/servicios', serviciosRoutes);
app.use ('/api/prestacion', PrestacionRoutes);
app.use ('/api/personas', PersonaRoutes);
app.use ('/api/recetas', RecetaRoutes);
app.use ('/api/actualizacion', ActualizacionRoutes);
app.use ('/api/utilitarios', UtilitariosRoutes);
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});


app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});


mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ooupxxs.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true ,
      useUnifiedTopology: true }            
  )
  .then(() => {    
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });

module.exports = app;