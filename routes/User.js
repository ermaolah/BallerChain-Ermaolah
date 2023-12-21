import express from 'express';

import { getUserById,addUser,getAllUsers,updateUser,login,forgotPassword,
    resetPassword, generateview, DeleteUser, getUsers} from '../controllers/userController.js';
import multer from '../middlewares/multer-config.js'; 
import auth from '../middlewares/auth.js'
import { convertToCoins, sendTokensToMyAddress } from '../controllers/token.js';
const router = express.Router();

router
    .route('/convertsteps').post(convertToCoins)

router
    .route('/sendToMe').post(sendTokensToMyAddress)

router
    .route('/').get(getAllUsers).post(multer,addUser)

router
    .route('/users').get(getUsers)

router
    .route('/login').post(login)

router
    .route('/:_id').put(multer,updateUser).get(getUserById)

router
    .route("/update/:token").put(auth,updateUser)

router
    .route("/delete/:_id").delete(auth,DeleteUser)

router
    .route("/reset/:token").post(resetPassword)

router
    .route("/mdpoublier").post(forgotPassword)

router
    .get("/reset/:token",generateview)


export default router;