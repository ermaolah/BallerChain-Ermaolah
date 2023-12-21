import { validationResult } from 'express-validator'; // Importer express-validator
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import { signAccessToken } from "../Middlewares/Auth.js";
import nodemailer from 'nodemailer';
import crypto from "crypto";
import { newAccount } from './token.js';


export function getAllUsers(req, res) {
    User
    .find({})
    .then(docs => {
        res.status(200).json(docs);
    })
    .catch(err => {
        res.status(500).json({ error: err });
    });
}


export function getUsers(req, res) {
  User.find({ role: "user" })
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
}



export function getUserById(req, res) {
    User
    .findOne({ "_id": req.params._id })
    .then(docs => {
        res.status(200).json(docs);
    })
    .catch(err => {
        res.status(500).json({ error: err });
    });
}



export async function addUser(req, res) {
    if(!validationResult(req).isEmpty()) {
        res.status(400).json({ errors: validationResult(req).array() });
    }
    const hashPass = await bcrypt.hash(req.body.password, 10);
    const account = await newAccount();

        User
        .create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            birthday:req.body.birthday,
            password:hashPass,
            image: "",//`${req.protocol}://${req.get('host')}/img/${req.file.filename}`,
            coins:0,
            steps: 0,
            publicAdress: account.address,
            privateAdress: account.privateKey
        })
        .then(newUser=> {
            res.status(200).json(newUser);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });

    
}

export function updateUser(req, res) {
    User
    .updateOne({ "_id": req.params._id },  { $set: req.body })
    .then(doc => {
        res.status(200).json("Profile updated");
    })
    .catch(err => {
        res.status(500).json({ error: err });
    });
}

export function DeleteUser(req, res) {
  const connectUser = req.auth.userId;
  //const Admin = req.body.role;
  User.findById(connectUser)
    .then((user) => {
      if (user.role !== "admin") {
        return res.status(401).json({ message: "not authorized" });
      }else{
      User.findOneAndRemove({ _id: req.params._id })
      .then((doc) => {
        res.status(200).json(doc);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
    }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

  export async function login(req, res, next) {
    try {
      const { firstname, password } = req.body;
  
      const user = await User.findOne({ firstname });
      if (!user) {
        return res.status(401).json({
          message: "No user found",
        });
      }
  
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(401).json({
          message: "Password does not match",
        });
      }
  
      const accessToken = await signAccessToken(user.id);
      res.status(200).json({
        message: "Login successful",
        accessToken,
        user,
      });
    } catch (error) {
        console.log(error)
      return res.status(500).json({
        message: "Error logging in",
        error,
      });
    }
  }

  export function forgotPassword(req, res) {
    const { email } = req.body;
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          return res
            .status(401)
            .json({ message: "Aucun utilisateur trouvé avec cet email." });
        }
        const token = crypto.randomBytes(100).toString("hex");
        const resetLink = `http://localhost:9090/user/reset/${token}`;
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 360000; // 1 hour
        user
          .save()
          .then((updatedUser) => {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user:  process.env.EMAIL_ADDRESS,
                pass:  process.env.EMAIL_PASSWORD,
              },
            });
            const mailOptions = {
              from: process.env.EMAIL_SENDER,
              to: email,
              subject: "Mot de passe oublié",
              html: `
<!doctype html>
<html lang="en-US">
<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email Template</title>
    <meta name="description" content="Reset Password Email Template.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!--100% body table-->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                          
                        
                          
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                            requested to reset your password</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            We cannot simply send you your old password. A unique link to reset your
                                            password has been generated for you. To reset your password, click the
                                            following link and follow the instructions.
                                        </p>
                                        <a href="${resetLink}"
                                            style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                            Password</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.Vidoc.com</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>
</html>`,
          };
          transporter.sendMail(mailOptions, (error) => {
            if (error) {
              console.log(error);
              return res.status(500).json({ error });
              }
              return res.status(200).json({
                message:
                  "Un email de réinitialisation de mot de passe a été envoyé.",
              });
            });
          })
          .catch((error) => {
            console.log("error");
            return res.status(500).json({ error });
          });
      })
      .catch((error) => {
        console.log("error");
        return res.status(500).json({ error });
      });
  }

export async function resetPassword(req, res) {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({
        message: "Invalid or expired password reset token.",
      });
    }
    const hashPass = await bcrypt.hash(req.body.password, 10);
    user.password = hashPass;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    return res.status(500).json({ error });
  }
}


export async function generateview(req, res) {
  try {
    return res.render("reset-password.ejs", { token: req.params.token });
  } catch (error) {
    return res.status(400).json(error);
  }
}