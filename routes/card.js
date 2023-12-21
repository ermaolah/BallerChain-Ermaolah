import express from 'express';
import {
    generatePack, getMyCards, getMyTeam, changePlayerPosition, allPlayers,
    getFixtures, getTeams } from '../controllers/card.js';
import { update_cards2, scrape } from '../controllers/scraper.js';
const router = express.Router();


router
    .route('/pack/:user/:power').get(generatePack)
router
    .route('/cards/:user').get(getMyCards)
router
    .route('/team/:user').get(getMyTeam)
router
    .route('/position/:user/:card/:position').get(changePlayerPosition)
router
    .route('/updateCards').get(update_cards2)
router
    .route('/scrape').get(scrape)

router
    .route('/allPlayers').get(allPlayers)
router
    .route('/getFixtures').get(getFixtures)
router
    .route('/getTeams').get(getTeams)

export default router;