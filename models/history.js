const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    Id: { type: String, required: true },
    History: [{
        Faculty : {type: String,required: true },
        RoomNo : {type: String,required: true },
        Floor: {type: Number,required: true },
        Inuse: {type: String,required: true },
    }],
});

const History = mongoose.model('History', historySchema);

module.exports = History;