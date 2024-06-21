const nodemailer = require('nodemailer');
const db = require('../models');
const { generateRandomSixDigitNumber } = require('../../utils');
const users = db.users
const Op = db.Sequelize.Op
require('dotenv').config();

exports.sendEmail = async (req, res) => {
    try {
        ['from', 'to']?.map(value => {
            if (!req.body[value]) {
                return res.status(400).send({
                    status: "error",
                    error_message: "Parameter tidak lengkap " + value,
                    code: 400
                })
            }
        })

        const existUser = await users.findOne({
            where: {
                email: { [Op.eq]: req.body.to },
                role: { [Op.eq]: 'customer' },
                deleted: { [Op.eq]: 0 }
            }
        })

        if (!existUser) {
            return res.status(400).send({
                status: "not found",
                error_message: "Email belum terdaftar",
                code: 400
            })
        }

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        const otp = generateRandomSixDigitNumber()
        const payload = {
            ...req.body,
            subject: "Reset Password",
            text: `Gunakan Kode OTP ini untuk verifikasi pemulihan password: ${otp}`,
        };
        transport.sendMail(payload, function (error, info) {
            if (error) throw Error(error);
            console.log('email send successfully');
            console.log(info);
        })
        const onUpdate = await users.update({
            reset_otp: otp,
            reset_status: existUser.reset_status + 1
        }, {
            where: {
                deleted: { [Op.eq]: 0 },
                id: { [Op.eq]:existUser.id}
            }
        })
        return res.status(200).send({
            status: "success",
            items: "Email sent",
            code: 200
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server mengalami gangguan!", error: error })
        return
    }
};