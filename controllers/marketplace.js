import user_card from '../models/user_card.js';
import Marketplace from '../models/marketplace.js';
import user from '../models/user.js';

export async function addCardToMarketplace(req, res) {
    const { user_id, card_id, price } = req.body;

    try {
        const userCard = await user_card.findOne({ _id: card_id, user: user_id });

        if (!userCard) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const marketplaceItem = new Marketplace({
            user_card: userCard._id,
            price: price
        });

        await marketplaceItem.save();

        return res.status(200).json({ message: 'Card added to marketplace' });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error adding card' });
    }
}

export async function getAllCardsFromMarketplace(req, res) {
    const filter = req.params.filter;
    const sortOptions = {};
    let minPrice = req.query.min;
    let maxPrice = req.query.max;

    if (maxPrice === undefined) 
        maxPrice = 100000000;
    if (minPrice === undefined)
        minPrice = 0;
    try {
        switch (filter) {
            case 'datea':
                sortOptions.createdAt = 1;
                break;
            case 'dated':
                sortOptions.createdAt = -1;
                break;
            case 'pricea':
                sortOptions.price = 1;
                break;
            case 'priced':
                sortOptions.price = -1;
                break;
        }

        const marketplaceItems = await Marketplace.find()
            .populate('user_card')
            .sort(sortOptions)
            .where('price')
            .gte(minPrice)
            .lte(maxPrice);

        return res.status(200).json(marketplaceItems);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export async function BuyCardFromMarketplace(req, res) {
    const buyerId = req.params.user;
    const itemId = req.params.card_id;

    try {
        const item = await Marketplace.findById(itemId).populate('user_card');

        if (!item) {
            throw new Error('Marketplace item not found');
        }

        const buyer = await user.findById(buyerId);
        if (!buyer) {
            throw new Error('Buyer not found');
        }

        if (buyer.balance < item.price) {
            throw new Error('Buyer does not have enough funds');
        }

        const seller = await user.findById(item.user_card.user);
        if (!seller) {
            throw new Error('Seller not found');
        }

        buyer.balance -= item.price;
        seller.balance += item.price;

        item.user_card.user = buyer._id;
        item.user_card.forSale = false;

        await buyer.save();
        await seller.save();
        await item.user_card.save();
        await item.remove();

        res.status(200).json({ message: 'Item purchased successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}