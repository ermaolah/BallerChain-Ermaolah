import Web3 from "web3";
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
import BallerChain from '../contract/BallerChain.json' assert { type: "json" };
const ballerChainContract = new web3.eth.Contract(BallerChain.abi, "0x26038d9f69A2cecfcAb6B09A957EAB41B81734C3");
const BCAddress = '0xF428497E9D57B2bad591280F86cAF1E22e978bD3';
import User from '../models/user.js';



export async function convertToCoins(req, res) {
    try {
        const user = await User.findOne({ _id: req.body.userid });
        if (user) {
            const steps = user.steps;
            const receipt = await ballerChainContract.methods.transfer(user.publicAdress, steps/1000)
                .send({ from: BCAddress, gas: 200000 });
            console.log('Transaction successful');
            const coins = await getBalance(user.publicAdress);
            const updatedUser = await User.findOneAndUpdate({ _id: req.body.userid }, { coins: coins, steps: 0}, { new: true });
            res.status(200).json(updatedUser);
        } else {
            throw new Error("User not found");
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error });
    }
}


export async function newAccount() {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

    const account = web3.eth.accounts.create();

    const toAccount = account.address;
    const value = web3.utils.toWei("0.1", "ether");

    const senderPrivateKey = "0xea8301f796c974e01dbd16873a8e32db80b8949deac22c92a7f8a6178c839c2f";
    await web3.eth.accounts.wallet.add(senderPrivateKey);
    await web3.eth.sendTransaction({ from: "0xF428497E9D57B2bad591280F86cAF1E22e978bD3", to: toAccount, value: value, gas: 21000 });

    // Get sender account balance
    const senderAddress = "0xF428497E9D57B2bad591280F86cAF1E22e978bD3";
    const senderBalance = await web3.eth.getBalance(senderAddress);
    console.log(`Sender Account Balance: ${web3.utils.fromWei(senderBalance)} ETH`);
    return account;
}

export async function getBalance(userAddress) {
    return new Promise(async (resolve) => {
        try {
            const balance = await ballerChainContract.methods.balanceOf(userAddress).call();
            console.log(`Token balance of address ${userAddress}: ${balance}`);
            resolve(balance);
        } catch (error) {
            console.error("Error checking token balance:", error);
            resolve(0); // Return default value of 0 in case of error
        }
    });
}


export async function sendTokensToMyAddress(userId, amount, receiverId) {
    try {
        const user = await User.findOne({ _id: userId });
        const receiver = await User.findOne({ _id: receiverId });
        console.log('Receiver:', receiverId, receiver);

        if (user) {
            const steps = user.steps;
            const userAddress = user.publicAdress;
            await web3.eth.accounts.wallet.add(user.privateAdress);
            const receipt = await ballerChainContract.methods.transfer(receiver.publicAdress, amount).send({ from: userAddress, gas: 200000 });

            console.log('Transaction successful');
            const coins = await getBalance(receiver.publicAdress);
            console.log(coins);

            const updatedUser = await User.findOneAndUpdate({ _id: userId }, { $inc: { coins: -amount } }, { new: true });
            const receiver2 = await User.findOneAndUpdate({ _id: receiverId }, { $inc: { coins: amount } }, { new: true });
            await receiver2.save();
            return updatedUser;
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error sending tokens to your address:', error);
        throw error;
    }
}


