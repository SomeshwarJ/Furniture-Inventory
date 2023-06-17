const mongoose = require("mongoose");

const oldRecordsSchema = new mongoose.Schema({
    Q_id: { type: String, required: true },
    productName: { type: String, required: true },
    description: { type: String, required: true },
    inVoice: { type: Number, required: true },
    dop: { type: Date, default: new Date(), required: true },
    company: { type: String, required: true },
    rate: { type: Number, required: true, min: 0 },
    taxType: { type: String, required: true },
    percentage: { type: Number, required: true, min: 0 },
    warranty: { type: Date, default: new Date(), required: true },
});

const OldRecord = mongoose.model('OldRecord', oldRecordsSchema);

module.exports = OldRecord;