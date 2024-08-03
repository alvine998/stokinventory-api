
const db = require('../models')
const stocks = db.stocks
const Op = db.Sequelize.Op
require('dotenv').config()

// Retrieve and return all notes from the database.
exports.list = async (req, res) => {
    try {
        const size = +req.query.size || 10;
        const page = +req.query.page || 0;
        const offset = size * page;

        const result = await stocks.findAndCountAll({
            where: {
                deleted: { [Op.eq]: 0 },
                partner_code: { [Op.eq]: req.header("x-partner-code") },
                ...req.query.id && { id: { [Op.in]: req.query.id.split(",") } },
                ...req.query.product_id && { product_id: { [Op.in]: req.query.product_id.split(",") } },
                ...req.query.store_id && { store_id: { [Op.in]: req.query.store_id.split(",") } },
                ...req.query.status && { status: { [Op.eq]: req.query.status } },
                ...req.query.expired == "1" && { expired_at: { [Op.gte]: req.query.date } },
                ...req.query.type && { type: { [Op.eq]: req.query.type } },
                ...req.query.search && {
                    [Op.or]: [
                        { product_name: { [Op.like]: `%${req.query.search}%` } },
                        { store_name: { [Op.like]: `%${req.query.search}%` } }
                    ]
                },
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
        ['product_id', 'product_name', 'product_code', 'store_id', 'store_name', 'store_code', 'qty', 'date', 'type']?.map(value => {
            if (!req.body[value]) {
                return res.status(400).send({
                    status: "error",
                    error_message: "Parameter tidak lengkap " + value,
                    code: 400
                })
            }
        })
        // const existUser = await stocks.findOne({
        //     where: {
        //         deleted: { [Op.eq]: 0 },
        //         code: { [Op.eq]: req.body.code }
        //     }
        // })
        // if (existUser) {
        //     return res.status(400).send({ message: "Toko Telah Terdaftar!" })
        // }
        const payload = {
            ...req.body,
        };
        const result = await stocks.create(payload)
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
        const result = await stocks.findOne({
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
        const onUpdate = await stocks.update(payload, {
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
        const result = await stocks.findOne({
            where: {
                deleted: { [Op.eq]: 0 },
                id: { [Op.eq]: req.query.id }
            }
        })
        if (!result) {
            return res.status(404).send({ message: "Data tidak ditemukan!" })
        }
        result.deleted = 1
        result.updated_on = new Date()
        await result.save()
        res.status(200).send({ message: "Berhasil hapus data" })
        return
    } catch (error) {
        return res.status(500).send({ message: "Gagal mendapatkan data admin", error: error })
    }
}