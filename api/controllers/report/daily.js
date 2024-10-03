
const db = require('../../models')
const daily_reports = db.daily_reports
const products = db.products
const Op = db.Sequelize.Op
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Retrieve and return all notes from the database.
exports.list = async (req, res) => {
    try {
        const size = +req.query.size || 10;
        const page = +req.query.page || 0;
        const offset = size * page;

        const result = await daily_reports.findAndCountAll({
            where: {
                deleted: { [Op.eq]: 0 },
                partner_code: { [Op.eq]: req.header("x-partner-code") },
                ...req.query.id && { id: { [Op.in]: req.query.id.split(",") } },
                ...req.query.store_id && { store_id: { [Op.eq]: req.query.store_id } },
                ...req.query.trx_code && { trx_code: { [Op.eq]: req.query.trx_code } },
                ...req.query.report_by && { 'report_by.id': { [Op.eq]: req.query.report_by } },
                ...req.query.search && {
                    [Op.or]: [
                        { trx_code: { [Op.like]: `%${req.query.search}%` } },
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
        ['trx_code', 'store_id', 'store_name', 'products', 'total_price', 'total_product']?.map(value => {
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
        const listProduct = req.body.products
        listProduct.forEach(async (element) => {
            const existProduct = await products.findOne({
                where: {
                    deleted: { [Op.eq]: 0 },
                    id: { [Op.eq]: element.id }
                }
            })
            if (!existProduct) {
                return res.status(400).send({ message: "Produk tidak ditemukan!" })
            }
            const onUpdate = await products.update({ stock: existProduct.stock - element.qty }, {
                where: {
                    deleted: { [Op.eq]: 0 },
                    id: { [Op.eq]: existProduct.id }
                }
            })
        });
        const result = await daily_reports.create(payload)
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
        const result = await daily_reports.findOne({
            where: {
                deleted: { [Op.eq]: 0 },
                id: { [Op.eq]: req.body.id },
                trx_code: { [Op.eq]: req.body.trx_code }
            }
        })
        if (!result) {
            return res.status(400).send({ message: "Data tidak ditemukan!" })
        }
        let payload = {
            ...req.body,
            updated_on: new Date()
        }
        const onUpdate = await daily_reports.update(payload, {
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
        const result = await daily_reports.findOne({
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