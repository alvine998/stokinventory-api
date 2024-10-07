
const db = require('../models')
const deliveries = db.deliveries
const stocks = db.stocks
const Op = db.Sequelize.Op
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Retrieve and return all notes from the database.
exports.list = async (req, res) => {
    try {
        const size = +req.query.size || 10;
        const page = +req.query.page || 0;
        const offset = size * page;

        const result = await deliveries.findAndCountAll({
            where: {
                deleted: { [Op.eq]: 0 },
                partner_code: { [Op.eq]: req.header("x-partner-code") },
                ...req.query.id && { id: { [Op.in]: req.query.id.split(",") } },
                ...req.query.delivered_by && { 'delivered_by.name': { [Op.eq]: req.query.delivered_by } },
                ...req.query.date_start && { created_on: { [Op.between]: [req.query.date_start, req.query.date_end] } }
            },
            order: [
                ['created_on', 'DESC'],
            ],
            attributes: { exclude: ['deleted'] },
            ...req.query.pagination == 'true' && {
                limit: size,
                offset: offset
            }
        })

        return res.status(200).send({
            status: "success",
            items: result.rows,
            total_items: result.count,
            total_pages: Math.ceil(result.count / size),
            current_page: page,
            code: 200
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server mengalami gangguan!", error: error })
        return
    }
};

exports.create = async (req, res) => {
    try {
        ['stocks', 'deliver_at']?.map(value => {
            if (!req.body[value]) {
                return res.status(400).send({
                    status: "error",
                    error_message: "Parameter tidak lengkap " + value,
                    code: 400
                })
            }
        })
        const payload = {
            ...req.body,
            partner_code: req.header("x-partner-code")
        };
        const result = await deliveries.create(payload)
        if (result) {
            const updateStock = await stocks.update({ status: 2 }, {
                where: {
                    deleted: { [Op.eq]: 0 },
                    id: { [Op.in]: payload.stocks.map((val) => val.id) },
                    status: 1
                }
            })
        }
        return res.status(200).send({
            status: "success",
            items: result,
            code: 200
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server mengalami gangguan!", error: error })
        return
    }
};

exports.update = async (req, res) => {
    try {
        const result = await deliveries.findOne({
            where: {
                deleted: { [Op.eq]: 0 },
                id: { [Op.eq]: req.body.id }
            }
        })
        if (!result) {
            return res.status(400).send({ message: "Data tidak ditemukan!" })
        }
        let payload = {
            ...req.body,
            updated_on: new Date()
        }
        const onUpdate = await deliveries.update(payload, {
            where: {
                deleted: { [Op.eq]: 0 },
                id: { [Op.eq]: req.body.id }
            }
        })
        res.status(200).send({ message: "Berhasil ubah data", update: onUpdate })
        return
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Gagal mendapatkan data admin", error: error })
    }
}

exports.delete = async (req, res) => {
    try {
        const result = await deliveries.findOne({
            where: {
                deleted: { [Op.eq]: 0 },
                id: { [Op.eq]: req.query.id }
            }
        })
        if (!result) {
            return res.status(404).send({ message: "Data tidak ditemukan!" })
        }
        if (result) {
            if (result) {
                const updateStock = await stocks.update({ status: 1 }, {
                    where: {
                        deleted: { [Op.eq]: 0 },
                        id: { [Op.in]: result.stocks.map((val) => val.id) },
                        status: 2
                    }
                })
            }
        }
        result.deleted = 1
        result.updated_on = new Date()
        await result.save()
        res.status(200).send({ message: "Berhasil hapus data" })
        return
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Gagal mendapatkan data admin", error: error })
        return 
    }
}