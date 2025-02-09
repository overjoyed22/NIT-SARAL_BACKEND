const express = require('express');
const app = express();
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')

const userRoute = require('./routes/user')
const courseRoute = require('./routes/course')
const studentRoute = require('./routes/student')
const feeRoute = require('./routes/fee')

mongoose.connect('mongodb+srv://overjoyed22:Pulkit2003@cluster0.kwzqx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(()=>{
    console.log('connected with databse')
})
.catch(err=>{
    console.log('err')
})


app.use(bodyParser.json())
app.use(cors());

// USING FILEUPLOAD 
app.use(fileUpload({
    useTempFiles : true,
   // tempFileDir : '/tmp/'
}));

//WHENEVER A REQUEST FROM FROM FRONTEND COMES app.js DIRECTS IT TO THE RESPECTIVE
// PLACE. FOR EXAMPLE REQUEST- BASEURL/FEE THEN WHATEVER IS SUPPOSED TO BE HAPPENED
// WILL BE HANDELED BY THE fee.js 


app.use('/user', userRoute)
app.use('/fee', feeRoute)
app.use('/course', courseRoute)
app.use('/student', studentRoute)


app.use('*', (req,res)=>{
    res.status(404).json({
        msg: 'bad request'
    })
})



module.exports = app;