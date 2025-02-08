const express = require('express')
const router = express.Router()
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')


cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})



// when a user will hit signup button then he will be directed to this part of the code;

// SIGNUP PART STARTS HERE
router.post('/signup',(req,res)=>{
  User.find({email:req.body.email}) // CHECKING IF USER ALREADY EXISTS
  .then(users=>{
    if(users.length>0){
       return res.status(500).json({
        error:"email already registered"
       })
    }
  })

  
  // cloudinary.uploader.upload(req.files.image.tempFilePath, (err, result) => {
  //   if (err || !result) {
  //     console.error("Cloudinary Upload Error:", err);
  //     return res.status(500).json({ error: "Image upload failed" });
  //   }
  
  //   bcrypt.hash(req.body.password, 10, (err, hash) => {
  //     if (err) {
  //       return res.status(500).json({ error: err });
  //     }
  
  //     const newUser = new User({
  //       _id: new mongoose.Types.ObjectId(),
  //       firstName: req.body.firstName,
  //       lastName: req.body.lastName,
  //       email: req.body.email,
  //       password: hash,
  //       imageUrl: result.secure_url,
  //       imageId: result.public_id,
  //     });
  
  //     newUser
  //       .save()
  //       .then((savedUser) => {
  //         res.status(200).json({ newUser: savedUser });
  //       })
  //       .catch((err) => {
  //         console.error("Database Save Error:", err);
  //         res.status(500).json({ error: "Failed to save user" });
  //       });
  //   });
  // }); 
  

  cloudinary.uploader.upload(req.files.image.tempFilePath,(err,result)=>{
    //console.log(result)

    // HASHING PASSWORD 
    bcrypt.hash(req.body.password,10,(err,hash)=>{
        if(err){
          return res.status(500).json({
            error:err
          })
        }
      const newUser = new User({
      _id: new mongoose.Types.ObjectId,
      fullName:req.body.fullName,
     // lastName:req.body.lastName,
      email:req.body.email,
      phone:req.body.phone,
      password:hash,
      imageUrl:result.secure_url,
      imageId:result.public_id
    })
    newUser.save() 
     .then(result=>{
      res.status(200).json({
        newUser:result
      })
     })
     .catch(err=>{
      console.log(err);
      res.status(500).json({
        error:err
      })
     })

    })
   
  })
})

// LOGIN PART STARTS HERE 

router.post('/login', (req,res) =>{
  User.find({email:req.body.email}) // CHECKING IF USER EXISTS OR NOT
  .then(users=>{
    //console.log(users[0],req.body.password)
    if(users.length == 0){
      return res.status(500).json({
        msg:"email not registered"
      })
    }
    bcrypt.compare(req.body.password,users[0].password, (err,result)=>{ // COMPARING PASSWORD GIVEN BY USER AND THE SAVED PASSWORD IN DATABASE
      if(!result){
        return res.status(500).json({
          error : "wrong password"
        })
      }
         const token = jwt.sign({  // CREATING TOKEN
          email:users[0].email,
          fullName:users[0].fullName,
          email:req.users[0].email,
          phone:req.users[0].phone,
          uid:users[0]._id
        },
        'nit-saral',
        {
          expiresIn:'365d'
        }
      );
      res.status(200).json({
          _id:users[0]._id,
          fullName:users[0].fullName,
          email:users[0].email,
          phone:users[0].phone,
          imageId:users[0].imageId,
          token:token
      })
    }) 
  })
})

module.exports = router;