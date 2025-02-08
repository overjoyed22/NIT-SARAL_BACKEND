const express = require('express');
const router = express.Router()
const checkAuth = require('../middleware/checkAuth')
const Fee = require('../models/Fee')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2;


/// FEE RELATED FUNCTIONALITIES

// add fee (IT IS A POST REQUEST)
router.post('/add-fee',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token,'nit-saral');

    const newFee = new Fee({
        _id: new mongoose.Types.ObjectId,
        fullName: req.body.fullName,
        phone: req.body.phone,
        courseId: req.body.courseId,
        uid: verify.uid,
        amount : req.body.amount,
        remark: req.body.remark
    })
     newFee.save()
     .then(result=>{
        res.status(200).json({
            newFee:result
        })
     })
     .catch(err=>{
        res.status(500).json({
            error:err
        })
     })
})

// GET ALL FEE COLLECTION DATA FOR ANY USER
router.get('/payment-history',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token,'nit-saral');
     
    Fee.find({uid:verify.uid})
    .then(result=>{
         res.status(200).json({
            paymentHistory:result
         })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })

})

// GET ALL PAYMENTS FOR ANY STUDENTS IN A COURSE

router.get('/all-payment',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token,'nit-saral');

    Fee.find({uid:verify.uid,courseId:req.query.courseId,phone:req.query.phone}) // INSURING UNIQUENESS OF PHONE NUMBER
    .then(result=>{
        res.status(500).json({
            fees:result
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})


module.exports = router;