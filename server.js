import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan'; // Importer morgan
import cors from 'cors'; // Importer cors

import { notFoundError, errorHandler } from './middlewares/error-handler.js';


import cardRoutes from './routes/card.js';
import userRoutes from './routes/User.js';
import marketplace from './routes/marketplace.js';
import { update_cards2 } from './controllers/scraper.js';

const app = express();
const port = process.env.PORT || 9090;
const databaseName = 'ballchain_test';

mongoose.set('debug', false);
mongoose.Promise = global.Promise;

mongoose
    .connect(`mongodb://localhost:27017/${databaseName}`)
    .then(() => {
        console.log(`Connected to ${databaseName}`);
    })
    .catch(err => {
        console.log(err);
    });

app.use(cors()); // Utiliser CORS
app.use(morgan('dev')); // Utiliser morgan
app.use(express.json()); // Pour analyser application/json
app.use(express.urlencoded({ extended: true })); // Pour analyser application/x-www-form-urlencoded
app.use('/img', express.static('public/images')); // Servir les fichiers sous le dossier public/images

// A chaque requête, exécutez ce qui suit
app.use((req, res, next) => {
    console.log("Middleware just ran !");
    next();
});


app.use('/card', cardRoutes);
app.use('/user', userRoutes);
app.use('/marketplace', marketplace);

// Utiliser le middleware de routes introuvables
app.use(notFoundError);
// Utiliser le middleware gestionnaire d'erreurs
app.use(errorHandler);

app.listen(port, () => {

    setInterval(() => {
        update_cards2();
    }, 24 * 60 * 60 * 1000);
    console.log(`Server running at http://localhost:${port}/`);
});