const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssestSchema = new Schema({

    applicantID: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type: String, required: true},
    type: {type: String, required: true},
    startDate: {type: String, required: true},
    appliedDate: {type: String, required: true},
    period: {type:String, required: true,},
    reason: {type: String, required: true},
    adminResponse: {type: String, default: 'N/A'},

});


module.exports = mongoose.model('Assest', AssestSchema);