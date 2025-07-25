import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    favoritePosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: [],
    }],
    resetPasswordToken: {
        type: String,
        default: undefined,
    },
    resetPasswordTokenExpiry: {
        type: Date,
        default: undefined,
    },
    pendingEmail: {
        type: String,
        default: undefined,
    },
    confirmEmailToken: {
        type: String,
        default: undefined,
    },
    confirmEmailTokenExpiry: {
        type: Date,
        default: undefined,
    },
},
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;