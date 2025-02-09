// // WE WILL USE THIS chechAuth AT MULTIPLE PLACES TO KEEP CHECK
// // WHETER THE USERS ONLY WITH PROPER AUTHORIZATION CAN DO ANYTHING IN THE SITE

// const jwt = require('jsonwebtoken')
// module.exports = (req,res,next) =>{
//      try{
//         const token = req.headers.authorization.split(" ")[1]
//         //   console.log(token)
//        const verify =  jwt.verify(token,'nit-saral');
//        //console.log(verify)
//        next();
//      }
//      catch(err){
//         return res.status(401).json({
//             msg : "invalid token"
//         })
//      }

// }


const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];  
        if (!token) {
            return res.status(401).json({ msg: "No token provided" });
        }

        const verify = jwt.verify(token, 'nit-saral'); 
        req.userData = verify;  
        next();
    } catch (err) {
        return res.status(401).json({ msg: "Invalid or expired token" });
    }
};
