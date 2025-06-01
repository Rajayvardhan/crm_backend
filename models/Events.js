// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String, // or Buffer if you want to store the actual image
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
