import express from 'express';
import { addFromFile, generatePack, register, getMyCards, getMyTeam, changePlayerPosition } from '../controllers/card.js';
import { update_cards2 } from '../controllers/scraper.js';
const router = express.Router();

/*router
    .route('').get(addFromFile);*/
router
    .route('/pack/:user/:power').get(generatePack);
/*router
    .route('/register').post(register);*/
router
    .route('/cards/:user').get(getMyCards);
router
    .route('/team/:user').get(getMyTeam);
router
    .route('/position/:user/:card/:position').get(changePlayerPosition);
/*router
    .route('/newList').get(get_cards_flashscore);*/
router
    .route('/updateCards').get(update_cards2);

export default router;