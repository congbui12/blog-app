import User from "../models/User.js";
import bcrypt from "bcrypt";

export const updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        let isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Password is incorrect' });

        let isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({ message: 'New password must be different from the old password' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.log('Update password failed: ', error);
        return res.status(500).json({ message: 'Server error' });
    }
}