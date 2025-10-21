import mongoose from "mongoose";


//Schema creating for user model
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        lowercase:true,
        required:true,
        trim:true,

    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

const User = mongoose.model('User', userSchema);
export default User;