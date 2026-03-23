import mongoose from "mongoose";

//MESSAGE SCHEMA TO STORE DATA IN JSON FORMAT
const messageSchema = new mongoose.Schema({


    senderId: {type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true},
    receiverId: {type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true},
    message: {type: String, required: true},

    
},{timestamps: true});

const Message = mongoose.model("Message", messageSchema);

export default Message;


//Message is the database name