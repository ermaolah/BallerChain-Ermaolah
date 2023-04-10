import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const playerSchema = new mongoose.Schema({
    card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    },
    niveau: {
        type: Number,
        required: true,
        default: 1
    },
    position: {
        type: Number,
        required: true,
        default: -1
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

export default model('user_card', playerSchema);
