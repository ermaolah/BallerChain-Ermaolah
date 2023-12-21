import axios from 'axios'
import cheerio from 'cheerio'
import user_card from '../models/user_card.js';
import card from '../models/card.js';


export async function scrape(req, res) {
    try {
        const teams = ['https://www.flashscore.com/team/arsenal/hA1Zm19f/squad/',
            'https://www.flashscore.com/team/manchester-city/Wtn9Stg0/squad/',
            'https://www.flashscore.com/team/newcastle-utd/p6ahwuwJ/squad/',
            'https://www.flashscore.com/team/manchester-united/ppjDR086/squad/',
            'https://www.flashscore.com/team/tottenham/UDg08Ohm/squad/',
            'https://www.flashscore.com/team/aston-villa/W00wmLO0/squad/',
            'https://www.flashscore.com/team/liverpool/lId4TMwf/squad/',
            'https://www.flashscore.com/team/brighton/2XrRecc3/squad/',
            'https://www.flashscore.com/team/fulham/69ZiU2Om/squad/',
            'https://www.flashscore.com/team/brentford/xYe7DwID/squad/',
            'https://www.flashscore.com/team/chelsea/4fGZN2oK/squad/',
            'https://www.flashscore.com/team/crystal-palace/AovF1Mia/squad/',
            'https://www.flashscore.com/team/west-ham/Cxq57r8g/squad/',
            'https://www.flashscore.com/team/wolves/j3Azpf5d/squad/',
            'https://www.flashscore.com/team/bournemouth/OtpNdwrc/squad/',
            'https://www.flashscore.com/team/leeds/tUxUbLR2/squad/',
            'https://www.flashscore.com/team/leicester/KrrdAMyI/squad/',
            'https://www.flashscore.com/team/everton/KluSTr9s/squad/',
            'https://www.flashscore.com/team/nottingham/UsushcZr/squad/',
            'https://www.flashscore.com/team/southampton/WdKOwxDM/squad/']
        teams.forEach(async (element) => {
            const response = await axios.get(element, 20000);

            const $ = cheerio.load(response.data);

            $('.lineup__row').each(async (index, element) => {
                const name = $(element).find('.lineup__cell--name').text().trim();
                const image = $(element).find('.lineup__cell--flag').attr('title');
                const matchesPlayed = parseInt($(element).find('.lineup__cell--matchesPlayed').text());
                const goalsScored = parseInt($(element).find('.lineup__cell--goal').text());
                const link = $(element).find('.lineup__cell--nameAndAbsence').find('a').attr('href');
                const imageResponse = await axios.get('https://www.flashscore.com' + link);
                const imageHtml = cheerio.load(imageResponse.data);
                const imageSrc = imageHtml('.heading__logo').attr('src');
                const imageUrl = 'https://www.flashscore.com' + imageSrc;
                var rating = (matchesPlayed * 4 + goalsScored) / 2;
                if (!rating) rating = 0;
                console.log(rating);
                if (rating < 60) {
                    rating = 60;
                }
                if (rating > 98) {
                    rating = 96;
                }

                const player = new card({
                    name: name,
                    image: imageUrl,
                    rating: rating,
                    link: link
                });
                player.save();
            });
        });
        console.log('Player data scraped and stored in MongoDB!');
        res.status(200).json({"message": "ok"});
    } catch (error) {
        console.error('Error scraping and storing player data:', error);
        res.status(500).json({"message": "not ok"});
    }
}


export async function update_cards2() {
    const cards = await card.find();
    cards.forEach(async (card) => {
        const event = await getEvent(card.link);

        if (!event) return;

        const minutes_played = getMinutesPlayed(event);
        const goals = getGoals(event);
        const formattedDate = getFormattedDate();

        if (event.eventStartTime == formattedDate) {
            await updateUserCards(card.id, goals, minutes_played);
            await checkAndUpdateUserCardLevels(card.id);
        }
    });
}

async function getEvent(link) {
    try {
        const response = await axios.get('https://www.flashscore.com' + link);
        const index = response.data.indexOf('lastMatches') + 13;
        const last_index = response.data.indexOf(']', index);
        const last_matches = response.data.substring(index, last_index + 1);
        const last_matches_array = JSON.parse(last_matches);
        return last_matches_array[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}

function getMinutesPlayed(event) {
    for (const key in event.stats) {
        if (event.stats[key].type === 'minutes-played') {
            return event.stats[key].value;
        }
    }
    return 0;
}

function getGoals(event) {
    for (const key in event.stats) {
        if (event.stats[key].type === 'goal') {
            return event.stats[key].value;
        }
    }
    return 0;
}

function getFormattedDate() {
    const today = new Date();
    const options = {year: '2-digit', month: '2-digit', day: '2-digit'};
    return today.toLocaleDateString('en-GB', options).replace(/\//g, '.');
}

async function updateUserCards(cardId, goals, minutesPlayed) {
    if (goals > 1 || minutesPlayed > 80) {
        try {
            await user_card.updateMany(
                {card: cardId, position: {$gt: -1}},
                {$inc: {niveau: 1}}
            );
        } catch (error) {
            console.log(error);
        }
    }
}

async function checkAndUpdateUserCardLevels(cardId) {
    try {
        const updatedUserCards = await user_card.find({card: cardId, position: {$gt: -1}});
        for (const userCard of updatedUserCards) {
            if (userCard.niveau > 10) {
                const randomUserCard = await getRandomUserCard(userCard.user);
                if (randomUserCard) {
                    const userCardId = randomUserCard._id;
                    await user_card.updateOne({_id: userCardId}, {$inc: {niveau: 1}});
                    console.log(`Updated user_card with id ${userCardId}`);
                    if (userCard.niveau > 100) {
                        const newRandomUserCard = await getRandomUserCard(userCard.user);
                        if (newRandomUserCard) {
                            const newCardId = newRandomUserCard.card;
                            await user_card.updateOne({
                                user: userCard.user,
                                card: newCardId,
                                position: {$gt: -1}
                            }, {$inc: {niveau: 1}});
                            console.log(`Updated new user_card with card id ${newCardId}`);
                        } else {
                            console.log('No user_cards matching the filter');
                        }
                    }
                } else {
                    console.log('No user_cards matching the filter');
                }
            }
        }
    } catch (error) {
        console.error(`Error occurred while checking and updating user card levels: ${error}`);
    }
}

async function getRandomUserCard(userId) {
    const userCards = await user_card.find({user: userId, position: {$gt: -1}});
    const numCards = userCards.length;
    if (numCards === 0) {
        return null;
    } else {
        const randomIndex = Math.floor(Math.random() * numCards);
        return userCards[randomIndex];
    }
}
