import mongoose from "mongoose";
// import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    resetPasswordToken: { type: String, default: undefined },
    resetPasswordTokenExpiry: { type: Date, default: undefined },
    // roles: { type: String, enum: ['admin', 'moderator', 'user'], default: 'user' },
},
    { timestamps: true }
);

// userSchema.methods.comparePassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
// }

const User = mongoose.model('User', userSchema);
export default User;