import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";
import dotenv from "dotenv";

dotenv.config();

let hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

let comparePassword = async function (plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

let sendEmail = async function (to, subject, html) {
    const transporter = await nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        }
    });
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
}

let generateSlug = function (title) {
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const id = nanoid(6);
    return `${cleanTitle}-${id}`;
}

export default {
    hashPassword,
    comparePassword,
    sendEmail,
    generateSlug,
}