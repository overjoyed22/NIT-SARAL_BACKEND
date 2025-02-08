const express = require('express');
const router = express.Router()
const checkAuth = require('../middleware/checkAuth')
const Course = require('../models/Courses')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2;
const Student = require('../models/Student');
const fee = require('../models/Fee')

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

// GET BATCH DETAILS


// ADDING NEW COURSE STARTS HERE
router.post('/add-course',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1]
    const verify =  jwt.verify(token,'nit-saral');

    cloudinary.uploader.upload(req.files.image.tempFilePath,(err,result)=>{
        const newCourse= new Course({
            _id: new mongoose.Types.ObjectId,
            courseName: req.body.courseName,
            price:req.body.price,
            description:req.body.description,
            startingDate: req.body.startingDate,
            endDate:req.body.endDate,
            uid:verify.uid,
           imageUrl: result.secure_url,
           imageId: result.public_id
        })
        newCourse.save()
        .then(result=>{
               res.status(200).json({
                newCourse:result
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

// GET ALL COURSES

router.get('/all-courses',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1]
    const verify = jwt.verify(token,'nit-saral');

    Course.find({uid:verify.uid})
    .select('_id uid courseName description price startingDate endDate imageUrl imageId')
    .then(result=>{
        res.status(200).json({
            courses:result
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})

// GET ONE COURSE FOR ANY USER

router.get('/course-detail/:id',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1]
    const verify = jwt.verify(token,'nit-saral');

    Course.findById(req.params.id)
    .select('_id uid courseName description price startingDate endDate imageUrl imageId')
    .then(result=>{
       // console.log(result)
       Student.find({courseId:req.params.id})
       .then(students=>{     // THIS WILL RETURN THE LIST OF STUDENTS IN THIS COURSE
        res.status(200).json({
            course:result,
            studentList:students
        })
       })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})

// DELETE  COURSE API

router.delete('/:id',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1]
    const verify = jwt.verify(token,'nit-saral');


    Course.findById(req.params.id)
    .then(course=>{
        console.log(course)
        if(course.uid==verify.uid){ // WE ARE VARIFYING THAT COURSE COULD BE DELETED ONLY BY THE USER WHO HAS THAT COURSE
            // DELETING
           Course.findByIdAndDelete(req.params.id)
           .then(result=>{
              cloudinary.uploader.destroy(course.imageId,(deletedImage)=>{ // WE NEED TO DELETE THE IMAGE IN CLOUDINARY ALSO
                Student.deleteMany({courseId:req.params.id})
                .then(data=>{
                    res.status(200).json({
                        result:data
                    })
                })
                .catch(err=>{
                    res.status(500).json({
                        msg:err
                    })
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
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err
         })
    })
})


// UPDATE COURSE

router.put('/:id', checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1]
    const verify = jwt.verify(token,'nit-saral');
    console.log(verify.uid);

    Course.findById(req.params.id)
    .then(course=>{
        // console.log(course)
        if(verify.uid!=course.uid){
            return res.status(500).json({
                error: "you are not eligible to update the course"
            })
        }
        if(req.files){
             console.log('file is there')
             cloudinary.uploader.destroy(course.imageId,(deletedImage)=>{
                cloudinary.uploader.upload(req.files.image.tempFilePath,(err,result)=>{
                    const newupdatedCourse={
                        //_id: new mongoose.Types.ObjectId,
                        courseName: req.body.courseName,
                        price:req.body.price,
                        description:req.body.description,
                        startingDate: req.body.startingDate,
                        endDate:req.body.endDate,
                        uid:verify.uid,
                       imageUrl: result.secure_url,
                       imageId: result.public_id
                    }
                    Course.findByIdAndUpdate(req.params.id,newupdatedCourse,{new:true})
                    .then(data=>{
                        res.status(200).json({
                            updatedCourse:data
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
                courseName: req.body.courseName,
                price:req.body.price,
                description:req.body.description,
                startingDate: req.body.startingDate,
                endDate:req.body.endDate,
                uid:verify.uid,
               imageUrl: course.imageUrl,
               imageId: course.imageId
            }
            Course.findByIdAndUpdate(req.params.id,updatedData,{new:true}) // THIS WILL UPDATE THE DATA NAD NOW WE WILL GET NEW DATA 
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


// GET LATEST 5 COURSES
router.get('/latest-courses',checkAuth,(req,res)=>{
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token,'nit-saral');
    Course.find({uid:verify.uid})
    .sort({$natural:-1}).limit(10)
    .then(result=>{
         res.status(200).json({
            courses:result
         })
          
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})

// HOME API 
// WE ARE USING TRY AND CATCH ASYNC AWAIT HERE INSTEAD OF THEN AND CATCH AS IN THEN AND CATCH WE HAD TO BUT A THEN CATCH FOR EVERY SINGLE THING
// BUT IN TRY CACTH WE CAN WRITE ALL THE STEPS IN TRY AND IF WE GET ERROR AT ANY STEP 
// IT CAN BE DETECTED IN A SINGLE CATCH BLOCK
router.get('/home',checkAuth,async(req,res)=>{
    try{  
        const token = req.headers.authorization.split(" ")[1];
        const verify = jwt.verify(token,'nit-saral');
        const  newCourses= await Course.find({uid:verify.uid}).sort({$natural:-1}).limit(10)
        const  newStudents = await Student.find({uid:verify.uid}).sort({$natural:-1}).limit(10)
        const totalCourse = await Course.countDocuments({uid:verify.uid})
        const totalStudent = await Course.countDocuments({uid:verify.uid})
        const totalAmount = await fee.aggreagate([
              {$match : {uid:verify.uid}},
              {$group : {_id:null,total:{$sum:"$amount"}}}
        ])

        res.status(200).json({
            courses:newCourses,
            students:newStudents,
            totalCourse: totalCourse,
            totalStudent:totalStudent,
            totalAmount:totalAmount.length>0 ? totalAmount[0].total : 0
        })
    }
    catch(err){
         res.status(500).json({
            error:err
         })
    }
})


module.exports = router; 