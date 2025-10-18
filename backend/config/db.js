import mongoose from "mongoose";


export const connectDb = () => {
    if(!process.env.MONGO_URI){
        console.error("Mongo Uri is not defined in the env")
        return
    }

    console.log("Connecting to MongoDb")

    mongoose.connect(process.env.MONGO_URI)
}