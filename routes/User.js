import express, { Router } from 'express';
 // Importer express-validator

import { getUserById,addUser,getAllUsers,updateUser,login,forgotPassword,
    resetPassword,generateview,DeleteUser,getUsers} from '../controllers/userController.js';
import multer from '../middlewares/multer-config.js'; 
import auth from '../middlewares/auth.js'
const router = express.Router();

router
  .route('/')
  .get(getAllUsers)
  .post(
// Utiliser multer
    multer,
    addUser);
router
    .route('/users')    
    .get(getUsers)    
router
    .route('/login')    
    .post(login)

router
    .route('/:_id')    
    .put( 
      multer,
      updateUser)
    .get(getUserById)

router
    .route("/update/:token")
    .put(auth,updateUser)
router
    .route("/delete/:_id")
    .delete(auth,DeleteUser)

router.route("/reset/:token").post(resetPassword);
router.get("/reset/:token",generateview);
router.route("/mdpoublier").post(forgotPassword)


export default router;