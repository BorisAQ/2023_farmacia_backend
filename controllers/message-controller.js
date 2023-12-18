const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Message = require('../models/message');
const User = require('../models/user');




const getMessageById = async (req, res, next) => {
  const messageId = req.params.mid;
  let message;
  try {
    message = await Message.findById(messageId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a message.',
      500
    );    
    return next(error);
  }
  if (!message) {
    const error = new HttpError(
      'Could not find the message for the provided id.',
      404
    );
    return next(error);
  }
  res.json({ message: message.toObject({ getters: true }) });
};

const getMessagesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

;  // let places;
  let userWithMessages;
  try {
    userWithMessages = await User.findById(userId).populate('messages');
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithMessages || userWithMessages.messages.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({
    messages: userWithMessages.messages.map(message =>
      message.toObject({ getters: true })
    )
  });
};

const createMessage = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { title, description } = req.body;
  const createdMessage = new Message({
    title,
    description,
    creator: req.userData.userId
  });
  let message;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }
  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdMessage.save({ session: sess });
    user.messages.push(createdMessage);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating message failed, please try again.',
      500
    );
    return next(error);
  }
  res.status(201).json({ message: createdMessage });
};

const updateMessage = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { title, description } = req.body;
  const messageId = req.params.mid;
  let message;
  try {
    message = await Message.findById(messageId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }
  if (message.creator.toString()!== req.userData.userId){
    const error = new HttpError(
      'You are not allowed to edit this places',
      401
    );
    return next(error);
  }
  message.title = title;
  message.description = description;

  try {
    await message.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }
  res.status(200).json({ message: message.toObject({ getters: true }) });
};

const deleteMessage = async (req, res, next) => {
  const messageId = req.params.mid;
  let message;
  try {
    message = await Message.findById(messageId).populate('creator');
  } catch (err) {
    const error = new HttpError(
    `Something went wrong, could not delete message...`,
      500
    );
    return next(error);
  }
  if (!message) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }
  if (message.creator.id!== req.userData.userId){
    const error = new HttpError(
      'You are not allowed to delete this Messages',
      403
    );
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await message.deleteOne({ session: sess });    
    message.creator.messages.pull(message);
    await message.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {    
    const error = new HttpError(
      'Something went wrong, could not delete place.!!!',
      500
    );
    return next(error);
  }
  res.status(200).json({ message: 'Deleted message.' });
};

exports.getMessageById = getMessageById;
exports.getMessagesByUserId = getMessagesByUserId;
exports.createMessage = createMessage;
exports.updateMessage = updateMessage;
exports.deleteMessage = deleteMessage;
