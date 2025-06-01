const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Userlater = new Schema({
    employeeID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    letterType: { type: String, required: true }, // Type of letter (offer letter, promotion, etc.)
    assignedDate: { type: Date, required: true, default: Date.now },
    letterPath: { type: String }, // Path of the generated letter (for storage)
});

module.exports = mongoose.model('UserLater', Userlater);