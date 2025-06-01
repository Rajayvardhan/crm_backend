const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeadSchema = new Schema({
  taskID: { type: Schema.Types.ObjectId, ref: 'Task' },
  Contact_No: String,
  name: String,

  address: String,
  District:String,
  State:String,
  result: { type: String, enum: ['Pass', 'Fail','Pending','Assigned'], default: null },
  duration: String,
  interest: { type: String, enum: ['Medium','Low', 'Hot', 'Cold','Warm'], default: null },
  reminder: Date,
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: Date
});

module.exports = mongoose.model('Lead', LeadSchema);
