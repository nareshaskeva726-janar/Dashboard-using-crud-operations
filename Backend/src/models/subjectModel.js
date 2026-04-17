import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        department: {
            type: String,
            enum: ["ESE", "EEE", "CSE", "MECH", "CIVIL"],
            required: true,
        },

        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        credits: {
            type: Number,
            default: 3,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Subject =
    mongoose.models.Subject || mongoose.model("Subject", subjectSchema);

export default Subject;