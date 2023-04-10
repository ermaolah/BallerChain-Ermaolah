import axios from 'axios'
import user_card from '../models/user_card.js';
import card from '../models/card.js';


/*
export async function update_cards2() {
    const cards = await card.find();
    cards.forEach((card) => {
        axios.get('https://www.flashscore.com' + card.link)
            .then(response => {
                const index = response.data.indexOf('lastMatches') + 13;
                const last_index = response.data.indexOf(']', index);
                const last_matches = response.data.substring(index, last_index + 1);
                const last_matches_array = JSON.parse(last_matches);
                const event = last_matches_array[0];

                let minutes_played = 0;
                let goals = 0;
                for (const key in event.stats) {
                    if (event.stats[key].type === 'minutes-played')
                        minutes_played = event.stats[key].value;
                    if (event.stats[key].type === 'goal')
                        goals = event.stats[key].value;

                }
                const today = new Date();
                const options = { year: '2-digit', month: '2-digit', day: '2-digit' };
                const formattedDate = today.toLocaleDateString('en-GB', options).replace(/\//g, '.');

                if (event.eventStartTime !== formattedDate) {
                    if (goals > 1 || minutes_played > 80)
                        user_card.updateMany(
                            { card: card.id, position: { $gt: -1 } }, // Specify filter with $gt operator
                            { $inc: { niveau: 1 } } // Include $inc operator in same object
                        )
                            .then(result => { })
                            .catch(error => {
                                console.log(error);
                            });
                    user_card.find({ card: card.id, position: { $gt: -1 } })
                        .then(updatedUserCards => {
                            for (const userCard of updatedUserCards) {
                                if (userCard.niveau > 10) {
                                    user_card.aggregate([
                                        { $match: { user: userCard.user, position: { $gt: -1 } } },
                                        { $sample: { size: 1 } }
                                    ])
                                        .then(randomUserCard => {
                                            if (randomUserCard.length > 0) {
                                                const userCardId = randomUserCard[0]._id;
                                                user_card.updateOne({ _id: userCardId }, { $inc: { niveau: 1 } })
                                                    .then(result => {
                                                        console.log(`Updated user_card with id ${userCardId}`);
                                                        if (userCard.niveau > 100) {
                                                            user_card.aggregate([
                                                                { $match: { user: userCard.user, position: { $gt: -1 } } },
                                                                { $sample: { size: 1 } }
                                                            ])
                                                                .then(newRandomUserCard => {
                                                                    if (newRandomUserCard.length > 0) {
                                                                        const newCardId = newRandomUserCard[0].card;
                                                                        user_card.updateOne({ user: userCard.user, card: newCardId, position: { $gt: -1 } }, { $inc: { niveau: 1 } })
                                                                            .then(newResult => {
                                                                                console.log(`Updated new user_card with card id ${newCardId}`);
                                                                            })
                                                                            .catch(newError => {
                                                                                console.log(newError);
                                                                            });
                                                                    } else {
                                                                        console.log('No user_cards matching the filter');
                                                                    }
                                                                })
                                                                .catch(newError => {
                                                                    console.log(newError);
                                                                });
                                                        }
                                                    })
                                                    .catch(error => {
                                                        console.log(error);
                                                    });
                                            } else {
                                                console.log('No user_cards matching the filter');
                                            }
                                        })
                                        .catch(error => {
                                            console.log(error);
                                        });


                                }
                            }
                        })
                };
            }
            )
    }
    );
}
*/


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
    const options = { year: '2-digit', month: '2-digit', day: '2-digit' };
    return today.toLocaleDateString('en-GB', options).replace(/\//g, '.');
}

async function updateUserCards(cardId, goals, minutesPlayed) {
    if (goals > 1 || minutesPlayed > 80) {
        try {
            await user_card.updateMany(
                { card: cardId, position: { $gt: -1 } },
                { $inc: { niveau: 1 } }
            );
        } catch (error) {
            console.log(error);
        }
    }
}

async function checkAndUpdateUserCardLevels(cardId) {
    try {
        const updatedUserCards = await user_card.find({ card: cardId, position: { $gt: -1 } });
        for (const userCard of updatedUserCards) {
            if (userCard.niveau > 10) {
                const randomUserCard = await getRandomUserCard(userCard.user);
                if (randomUserCard) {
                    const userCardId = randomUserCard._id;
                    await user_card.updateOne({ _id: userCardId }, { $inc: { niveau: 1 } });
                    console.log(`Updated user_card with id ${userCardId}`);
                    if (userCard.niveau > 100) {
                        const newRandomUserCard = await getRandomUserCard(userCard.user);
                        if (newRandomUserCard) {
                            const newCardId = newRandomUserCard.card;
                            await user_card.updateOne({ user: userCard.user, card: newCardId, position: { $gt: -1 } }, { $inc: { niveau: 1 } });
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
    const userCards = await user_card.find({ user: userId, position: { $gt: -1 } });
    const numCards = userCards.length;
    if (numCards === 0) {
        return null;
    } else {
        const randomIndex = Math.floor(Math.random() * numCards);
        return userCards[randomIndex];
    }
}
