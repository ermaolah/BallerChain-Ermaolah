
# Blockchain-based Fantasy Football Web Application

## Description

This project is a web application that leverages blockchain technology for a fantasy football gaming experience. It is written in JavaScript, using npm for package management and the Web3.js library for interacting with the Ethereum blockchain. The application incorporates a user-friendly interface for managing virtual football cards, trading, and participating in fantasy football challenges.

## Key Features

1. **Blockchain Interaction**: Utilizes Web3.js to interact with Ethereum smart contracts. This includes handling token transactions, account management, and retrieving balance information.

2. **User Management**: A User model is implemented for managing user data.
3. **Controllers**:
    - `convertToCoins`: Converts user's steps into coins and updates the database.
    - `newAccount`: Creates and funds a new Ethereum account.
    - `getBalance`: Retrieves token balance from a smart contract.
    - `sendTokensToMyAddress`: Transfers tokens between users and updates their coin counts.

4. **Fantasy Football Features**:
    - Card scraping and daily updates for player performance.
    - Users can build and manage teams using virtual cards.
    - Performance-based card level upgrades.
    - Trading cards in the marketplace.
    - Buying packs with random cards, with probabilities based on pack price.

5. **Error Handling**: Includes comprehensive error handling for various scenarios, such as missing user data.


## Environment Variables
Create a `.env` file in the root directory with the following contents:
```
EMAIL_ADDRESS=
EMAIL_PASSWORD=
EMAIL_SENDER=
PORT=
MONGODB_URI=
```
### Setting Up

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Set up environment variables for blockchain interaction.
4. Run the application.

## Contributing

We welcome contributions. Please follow these steps:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to your branch.
5. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

---

## Card Management Routes

### Pack Generation
- **GET `/pack/:user/:power`**: Generates a pack for a user based on their power level.

### User Cards
- **GET `/cards/:user`**: Retrieves all cards owned by a user.

### User Team
- **GET `/team/:user`**: Fetches the user's team details.

### Change Player Position
- **GET `/position/:user/:card/:position`**: Changes the position of a player in the user's team.

### Update Cards
- **GET `/updateCards`**: Updates card information in the database.

### Scrape Data
- **GET `/scrape`**: Scrapes and updates player data.

### Player and Team Data
- **GET `/allPlayers`**: Retrieves all player data.
- **GET `/getFixtures`**: Fetches current fixtures.
- **GET `/getTeams`**: Retrieves all team data.

## Marketplace Routes

### Add Card to Marketplace
- **POST `/addCard`**: Allows users to add a card to the marketplace.

### Get Marketplace Cards
- **GET `/getCards/:filter`**: Retrieves cards from the marketplace based on specified filters.

### Buy Card from Marketplace
- **GET `/buyCard/:card_id/:user`**: Enables users to buy a card from the marketplace.

### Marketplace Filtering
The `getAllCardsFromMarketplace` function supports various filters for sorting and price range. Users can sort cards by date (`datea` for ascending, `dated` for descending) and price (`pricea` for ascending, `priced` for descending). They can also specify minimum (`min`) and maximum (`max`) price ranges for their search.

## Fixture Endpoints
- **GET `/getFixtures`**: Fetches all fixtures. Returns a JSON array of fixture objects.

## Team Endpoints
- **GET `/getTeams`**: Fetches all teams. Returns a JSON array of team objects.

## User Endpoints
- **POST `/convertsteps`**: Converts a user's steps into coins.
- **POST `/sendToMe`**: Sends tokens to a user's address.
- **GET `/`**: Fetches all users. Returns a JSON array of user objects.
- **POST `/`**: Adds a new user with provided data.
- **GET `/users`**: Fetches all users. Returns a JSON array of user objects.
- **POST `/login`**: Logs in a user with username and password.
- **PUT `/:_id`**: Updates a user. Replace `:_id` with the user's ID.
- **GET `/:_id`**: Fetches a user by ID. Replace `:_id` with the user's ID.
- **PUT `/update/:token`**: Updates a user's data. Replace `:token` with the user's token.
- **DELETE `/delete/:_id`**: Deletes a user. Replace `:_id` with the user's ID.
- **POST `/reset/:token`**: Resets a user's password. Replace `:token` with the user's token.
- **POST `/mdpoublier`**: Sends a password reset link.
- **GET `/reset/:token`**: Generates a view for password reset. Replace `:token` with the user's token.

## Scraper Endpoints
- **GET `/updateCards`**: Updates the cards.
- **GET `/scrape`**: Scrapes data.


