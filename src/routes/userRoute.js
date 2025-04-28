import express from "express";
import { updateUser } from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.put('/update', isAuthenticated, updateUser);
userRouter.post('/logout', isAuthenticated, (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }

        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({ message: 'Error destroying session' });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logout successfully' });
        })
    });
})

export default userRouter;
