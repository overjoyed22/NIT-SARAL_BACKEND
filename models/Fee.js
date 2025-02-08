const mongoose = require('mongoose');
const feeSchema = new mongoose.Schema({
     _id:mongoose.Types.ObjectId,
     fullName:{
        type:String,
        required: true
     },
     phone:{
        type:String,
        required: true
     },
    //  email:{
    //     type:String,
    //     required: true
    //  },  
     courseId:{
        type:String,
        required: true
     },
     uid:{
        type:String,
        required:true
     },
     amount:{
        type:Number,
        required:true
     },
     remark:{
        type:String,
        required:true
     }
},{timestamps:true}) // TIMESTAMPS TO KEEP TRACK WHEN THE STUDENT WAS ADDED


module.exports = mongoose.model('Fee',feeSchema);