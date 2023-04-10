import express from 'express';
import { addCardToMarketplace, getAllCardsFromMarketplace, BuyCardFromMarketplace } from '../controllers/marketplace.js';

const router = express.Router();

router
    .route('/addCard').post(addCardToMarketplace);
router
    .route('/getCards/:filter').get(getAllCardsFromMarketplace);
router
    .route('/buyCard/:card_id/:user').get(BuyCardFromMarketplace);

export default router;