import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const statSchema = new mongoose.Schema({
    PAC: {
        type: Number,
        required: true
    },
    SHO: {
        type: Number,
        required: true
    },
    PAS: {
        type: Number,
        required: true
    },
    DRI: {
        type: Number,
        required: true
    },
    DEF: {
        type: Number,
        required: true
    },
    PHY: {
        type: Number,
        required: true
    }
});

export default model('Stat', statSchema);
