import Message from "../models/Message.js";

//MSG CONNECT FUNCTION
export const msgconnect = async (req, res) => {
  try {

    const { senderId, receiverId } = req.params;

    // validation
    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "senderId and receiverId are required",
      });
    }

    // fetch chat messages
    const messages = await Message.find({
      
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: -1 }) // newest → oldest
      .lean(); // faster response

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });

  } catch (error) {

    console.error("Error fetching messages:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching messages",
    });

  }
};