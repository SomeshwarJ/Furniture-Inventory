const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    Id: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;