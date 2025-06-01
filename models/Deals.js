// models/Deal.js
const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    value: {
        type: Number,
        default: 0  
    },
    status: {
        type: String,
        enum: ['untouched', 'next_meeting', 'quotation', 'won','Loss'], // 🔁 updated stages
        default: 'untouched'
      },
    assigned_leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assigned_employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reminder: {
        type: Date
    },
    reminder: {
        type: Date
    },
    deadline: {
        type: Date
    },
    meeting_type: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    meeting_link: {
        type: String,
        default: ''
    }

}, { timestamps: true });

module.exports = mongoose.model('Deals', dealSchema);
