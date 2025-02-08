const express = require('express');
const router = express.Router()
const checkAuth = require('../middleware/checkAuth')
const Student = require('../models/Student')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2;
const Fee = require('../models/Fee')
const Course = require('../models/Courses')

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

/// STUDENT RELATED FUNCTIONALITIES



// ADD NEW STUDENT 
router.post('/add-student',checkAuth,(req,res)=>{ // AUTHORIZATION IS CHECKED HERE 
    const token = req.headers.authorization.split(" ")[1]
    const verify =  jwt.verify(token,'nit-saral');

    cloudinary.uploader.upload(req.files.image.tempFilePath,(err,result)=>{
        const newStudent = new Student({
            _id: new mongoose.Types.ObjectId,
            fullName:req.body.fullName,
            phone:req.body.phone,
            email:req.body.email,
            courseId:req.body.courseId,
            address:req.body.address,
            uid:verify.uid,
           imageUrl: result.secure_url,
           imageId: result.public_id
        })
        newStudent.save()
        .then(result=>{
            res.status(200).json({
                newStudent:result
            })
        })
        .catch(err=>{
            console.log(err)
            res.status(500).json({
                error:err
            })
        })
    })

 
})



// GET ALL OWN STUDENT

router.get('/all-students',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1]
    const verify = jwt.verify(token,'nit-saral');

    Student.find({uid:verify.uid})
    .select('_id uid fullName phone address email courseId imageUrl imageId')
    .then(result=>{
        res.status(200).json({
            students:result
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})

// GET ALL OWN STUDENT FOR A COURSE

router.get('/all-students/:courseId',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1]
    const verify = jwt.verify(token,'nit-saral');

    Student.find({uid:verify.uid,courseId:req.params.courseId})
    .select('_id uid fullName phone address email courseId imageUrl imageId')
    .then(result=>{
        res.status(200).json({
            students:result
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})

// DELETING A STUDENT
router.delete('/:id',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1]
    const verify = jwt.verify(token,'nit-saral');


    Student.findById(req.params.id)
    .then(student=>{
        console.log(student)
        if(student.uid==verify.uid){ // WE ARE VARIFYING THAT COURSE COULD BE DELETED ONLY BY THE USER WHO HAS THAT COURSE
            // DELETING
           Student.findByIdAndDelete(req.params.id)
           .then(result=>{
              cloudinary.uploader.destroy(student.imageId,(deletedImage)=>{ // WE NEED TO DELETE THE IMAGE IN CLOUDINARY ALSO
                res.status(200).json({
                    result:result
                })
              })
           })
           .catch(err=>{
            res.status(500).json({
                msg:err
            })
           })
        }
        else{
           res.status(500).json({
            msg:'bad request'
           })
        }
    })
})

// GET STUDENT DETAIL BY ID
router.get('/student-detail/:id',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1]
    const verify = jwt.verify(token,'nit-saral');
     Student.findById(req.params.id)
     .select('_id uid fullName phone address email courseId imageUrl imageId')
     .then(result=>{
        Fee.find({
           uid:verify.uid,
           courseId:result.courseId,
           phone:result.phone
        })
        .then(feeData=>{
            Course.findById(result.courseId)
            .then(courseDetail=>{
                res.status(200).json({
                    studentDetail:result,
                    feeDetail:feeData,
                    courseDetail:courseDetail
                })
            })
            .catch(err=>{
                console.log(err);
                res.status(500).json({
                    error:err
                })
            })      
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({
                error:err
            })
        })
     })
     .catch(err=>{
        res.status(500).json({
            error: err
        })
     })
})


// UPDATING STUDENT INFO

router.put('/:id', checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1]
    const verify = jwt.verify(token,'nit-saral');
    console.log(verify.uid);

    Student.findById(req.params.id)
    .then(student=>{
        // console.log(course)
        if(verify.uid!=student.uid){
            return res.status(500).json({
                error: "you are not eligible to update the data"
            })
        }
        if(req.files){
             console.log('file is there')
             cloudinary.uploader.destroy(student.imageId,(deletedImage)=>{
                cloudinary.uploader.upload(req.files.image.tempFilePath,(err,result)=>{
                    const newupdatedStudent={
                        //_id: new mongoose.Types.ObjectId,
                        fullName:req.body.fullName,
                        phone:req.body.phone,
                        email:req.body.email,
                        courseId:req.body.courseId,
                        address:req.body.address,
                        uid:verify.uid,
                        imageUrl: result.secure_url,
                        imageId: result.public_id
                    }
                    Student.findByIdAndUpdate(req.params.id,newupdatedStudent,{new:true})
                    .then(data=>{
                        res.status(200).json({
                            updatedStudent:data
                        })
                    })
                    .catch(err=>{
                        console.log(err)
                        res.status(500).json({
                           error:err 
                        })
                    })
                })
             })
        }else{
            console.log("file is not there")
            const updatedData ={
                        fullName:req.body.fullName,
                        phone:req.body.phone,
                        email:req.body.email,
                        courseId:req.body.courseId,
                        address:req.body.address,
                        uid:verify.uid,
                        imageUrl: student.imageUrl,
                        imageId: student.imageId
            }
            Student.findByIdAndUpdate(req.params.id,updatedData,{new:true}) // THIS WILL UPDATE THE DATA NAD NOW WE WILL GET NEW DATA 
            .then(data=>{
                res.status(200).json({
                    updatedData:data
                })
            })
            .catch(err=>{
                console.log(err)
                res.status(500).json({
                    error:err
                })
            })
        }
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})

// GET LATEST 5 STUDENTS
router.get('/latest-students',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token,'nit-saral');
    Student.find({uid:verify.uid})
    .sort({$natural:-1}).limit(10)
    .then(result=>{
         res.status(200).json({
            students:result
         })
          
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})


module.exports = router;