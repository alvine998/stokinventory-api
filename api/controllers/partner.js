
const db = require('../models')
const partners = db.partners
const Op = db.Sequelize.Op
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Retrieve and return all notes from the database.
exports.list = async (req, res) => {
    try {
        const size = +req.query.size || 10;
        const page = +req.query.page || 0;
        const offset = size * page;

        const result = await partners.findAndCountAll({
            where: {
                deleted: { [Op.eq]: 0 },
                ...req.query.id && { id: { [Op.in]: req.query.id.split(",") } },
                ...req.query.is_whitelabel && { is_whitelabel: { [Op.eq]: req.query.is_whitelabel } },
                ...req.query.package_name && { package_name: { [Op.eq]: req.query.package_name } },
                ...req.query.search && {
                    [Op.or]: [
                        { name: { [Op.like]: `%${req.query.search}%` } },
                        { package_name: { [Op.like]: `%${req.query.search}%` } }
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
        ['name', 'package_name']?.map(value => {
            if (!req.body[value]) {
                return res.status(400).send({
                    status: "error",
                    error_message: "Parameter tidak lengkap " + value,
                    code: 400
                })
            }
        })
        const existUser = await partners.findOne({
            where: {
                deleted: { [Op.eq]: 0 },
                package_name: { [Op.eq]: req.body.package_name }
            }
        })
        if (existUser) {
            return res.status(400).send({ message: "Partner Telah Terdaftar!" })
        }
        const payload = {
            ...req.body,
            partner_code: req.header("x-partner-code")
        };
        const result = await partners.create(payload)
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
        const result = await partners.findOne({
            where: {
                deleted: { [Op.eq]: 0 },
                id: { [Op.eq]: req.body.id },
                package_name: { [Op.eq]: req.body.package_name }
            }
        })
        if (!result) {
            return res.status(400).send({ message: "Data tidak ditemukan!" })
        }
        let payload = {
            ...req.body,
            updated_on: new Date()
        }
        const onUpdate = await partners.update(payload, {
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
        const result = await partners.findOne({
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