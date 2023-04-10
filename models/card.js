import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    link: {
        type: String,
        required: true
    }
});

export default model('Player', playerSchema);
