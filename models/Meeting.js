const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    venue: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endDate: { type: Date, required: true },
    endTime: { type: String, required: true },
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deals', required: true },
    employeeId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
