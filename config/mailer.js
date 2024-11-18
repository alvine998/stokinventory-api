const nodemailer = require('nodemailer');
require('dotenv').config()

exports.transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'mail.domain.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER || 'root',
        pass: process.env.MAIL_PASS || ""
    },
    tls: {
        rejectUnauthorized: false
    }
})