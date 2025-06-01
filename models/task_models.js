const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  title: String,
  priority: String,
  description: String,
  team: { type: String, enum: ['Sales', 'Dev'] },
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  Status:{type:String,enum:["Todo","Progress","Pending","Done"]},
  remark: { type: String } // ✅ added this
});

module.exports = mongoose.model('Task', TaskSchema);
