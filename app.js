const gv= require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const messagesRoutes = require('./routes/message-routes');
const usersRoutes = require('./routes/user-routes');
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



app.use('/api/messages', messagesRoutes);
app.use('/api/users', usersRoutes);
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
    `mongodb+srv://borisA:45898@cluster0.ooupxxs.mongodb.net/msg?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });

module.exports = app;