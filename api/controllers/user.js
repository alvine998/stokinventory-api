
const db = require('../models')
const users = db.users
const Op = db.Sequelize.Op
const encrypt = require('bcryptjs')
require('dotenv').config()

// Retrieve and return all notes from the database.
exports.list = async (req, res) => {
    try {
        const size = +req.query.size || 10;
        const page = +req.query.page || 0;
        const offset = size * page;

        const result = await users.findAndCountAll({
            where: {
                deleted: { [Op.eq]: 0 },
                partner_code: { [Op.eq]: req.header('x-partner-code') },
                ...req.query.id && { id: { [Op.eq]: req.query.id } },
                ...req.query.role && { role: { [Op.in]: req.query.role.split(",") } },
                ...req.query.isCustomer == '1' && { google_id: { [Op.not]: null } },
                ...req.query.isCustomer == '0' && { google_id: { [Op.is]: null } },
                ...req.query.google_id && { google_id: { [Op.eq]: req.query.google_id } },
                ...req.query.search && {
                    [Op.or]: [
                        { name: { [Op.like]: `%${req.query.search}%` } },
                        { email: { [Op.like]: `%${req.query.search}%` } },
                        { phone: { [Op.like]: `%${req.query.search}%` } },
                    ]
                },
            },
            order: [
                ['created_on', 'DESC'],
            ],
            attributes: { exclude: ['deleted', 'password'] },
            ...req.query.pagination == 'true' && {
                limit: size,
                offset: offset
            }
        })
        return res.status(200).send({
            status: "success",
            items: result,
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
        ['name', 'password', 'role']?.map(value => {
            if (!req.body[value]) {
                return res.status(400).send({
                    status: "error",
                    error_message: "Parameter tidak lengkap " + value,
                    code: 400
                })
            }
        })
        const salt = await encrypt.genSalt(10)
        const password = await encrypt.hash(req.body.password, salt)
        const payload = {
            ...req.body,
            partner_code: req.header('x-partner-code'),
            password: password
        };
        const result = await users.create(payload)
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
        const result = await users.findOne({
            where: {
                deleted: { [Op.eq]: 0 },
                id: { [Op.eq]: req.body.id }
            }
        })
        if (!result) {
            return res.status(400).send({ message: "Data tidak ditemukan!" })
        }
        let payload = {}
        if (req.body.password) {
            const salt = await encrypt.genSalt(10)
            const password = await encrypt.hash(req.body.password, salt)
            payload = {
                ...req.body,
                password: password
            }
        } else {
            payload = {
                ...req.body
            }
        }
        const onUpdate = await users.update(payload, {
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
        const result = await users.findOne({
            where: {
                deleted: { [Op.eq]: 0 },
                id: { [Op.eq]: req.query.id }
            }
        })
        if (!result) {
            return res.status(404).send({ message: "Data tidak ditemukan!" })
        }
        result.deleted = 1
        await result.save()
        res.status(200).send({ message: "Berhasil hapus data" })
        return
    } catch (error) {
        return res.status(500).send({ message: "Gagal mendapatkan data admin", error: error })
    }
}

exports.login = async (req, res) => {
    try {
        const { identity, password } = req.body;
        if (!identity || !password) {
            return res.status(404).send({ message: "Masukkan Email / No Telepon dan Password!" })
        }
        const result = await users.findOne({
            where: {
                deleted: { [Op.eq]: 0 },
                status: { [Op.eq]: 1 },
                [Op.or]: {
                    phone: req.body.identity,
                    email: req.body.identity
                }
            },
        })
        if (!result) {
            return res.status(404).send({ message: "Akun Belum Terdaftar!" })
        }
        const isCompare = await encrypt.compare(password, result.password)
        if (!isCompare) {
            return res.status(404).send({ message: "Password Salah!" })
        }
        console.log({ ...result, password: "" });
        return res.status(200).send({ message: "Berhasil Login", user: { ...result, password: "" } })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Gagal mendapatkan data admin", error: error })
    }
}