import mongoose from "mongoose";

//DATABASE CONNECTION
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MONGODB CONNECTED SUCCESSFULLY")
        
    } catch (error) {
        console.log("ERROR IN connectDB Function", error);
        process.exit(1);
    }
}

export default connectDB;