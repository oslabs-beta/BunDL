const mongoose = require('mongoose');
// import mongoose from 'mongoose'
const URI = 'mongodb+srv://gmogi92:basketball123@cluster0.jtsrl7y.mongodb.net/';

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));

  const Schema = mongoose.Schema;

  const spiderSchema = new Schema({
    name: String,
    legs: Number,
    eyes: Number,
    venomous: Boolean,
    location: String,

  });
  
  const Spider = mongoose.model('Spider', spiderSchema);

  module.exports = Spider;