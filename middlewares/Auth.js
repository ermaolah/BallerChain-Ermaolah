import  jwt  from 'jsonwebtoken';
import createError from 'http-errors';

export function  signAccessToken (userId) {
    return new Promise((resolve, reject) => {
      const payload = {_id: userId}
      const secret = 'verySecretValue'
      const options = {
        audience: userId,
      }
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message)
          reject(createError.InternalServerError())
          return
        }
        resolve(token)
      })
    })
  }

  export default function auth (req, res, next){
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'verySecretValue');
        const userId = decodedToken._id;
        req.auth = {
            userId: userId
        };
     next();
    } catch(error) {
        res.status(401).json({ error });
    }
 };
  
  export function signRefreshToken (userId) {
    return new Promise((resolve, reject) => {
      const payload = {}
      const secret = 'verySecretValue'
      const options = {
        expiresIn: '1y',
        audience: userId,
      }
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message)
          // reject(err)
          reject(createError.InternalServerError())
        }

        client.SET(userId, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
          if (err) {
            console.log(err.message)
            reject(createError.InternalServerError())
            return
          }
          resolve(token)
        })
      })
    })
  }

