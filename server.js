import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';

import { notFoundError, errorHandler } from './middlewares/error-handler.js';


import cardRoutes from './routes/card.js';
import userRoutes from './routes/User.js';
import marketplace from './routes/marketplace.js';
import { update_cards2 } from './controllers/scraper.js';

const app = express();
const port = process.env.PORT || 9090;

mongoose.set('debug', false);
mongoose.Promise = global.Promise;

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log(`Connected to Database`);
    })
    .catch(err => {
        console.log(err);
    });

app.use(cors()); //CORS
app.use(morgan('dev')); // morgan
app.use(express.json()); // analyse application/json
app.use(express.urlencoded({ extended: true })); //analyse application/x-www-form-urlencoded
app.use('/img', express.static('public/images')); // Serve static from public/images

// Middleware de test
app.use((req, res, next) => {
    console.log("Middleware just ran !");
    next();
});


app.use('/card', cardRoutes);
app.use('/user', userRoutes);
app.use('/marketplace', marketplace);

app.use(notFoundError);
app.use(errorHandler);

app.listen(port, () => {

    setInterval(() => {
        update_cards2();
    }, 24 * 60 * 60 * 1000);
    console.log(`Server running at http://localhost:${port}/`);
});