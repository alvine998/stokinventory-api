const db = require('../models')
const partners = db.partners
const Op = db.Sequelize.Op
require('dotenv').config()

exports.middlewareHere = async (req, res, next) => {
    try {
        if (req.header('bearer-token') !== "stokinventoryapi") {
            return res.status(401).send({
                message: "Access Denied!",
                code: 401
            })
        }
        next()
    } catch (error) {
        console.log(error);
    }
}

exports.middlewarePartnerCode = async (req, res, next) => {
    try {
        const existPartner = await partners.findOne({
            where: {
                deleted: { [Op.eq]: 0 },
                package_name: { [Op.eq]: req.header('x-partner-code') }
            }
        })
        if (req.header('x-partner-code') === "" || !req.header('x-partner-code')) {
            return res.status(401).send({
                message: "Silahkan Tentukan Mitra Asal!",
                code: 401
            })
        }
        if (!existPartner) {
            return res.status(401).send({
                message: "Mitra Tidak Ditemukan!",
                code: 401
            })
        }
        next()
    } catch (error) {
        console.log(error);
    }
}