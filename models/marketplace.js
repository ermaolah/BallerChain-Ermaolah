import mongoose from 'mongoose';
const { Schema, model } = mongoose;
import user_card from '../models/user_card.js';

const marketplaceSchema = new mongoose.Schema({
    user_card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user_card',
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

export default model('Marketplace', marketplaceSchema);