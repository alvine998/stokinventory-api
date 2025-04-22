
const { generateTransactionCode } = require('../../utils')
const db = require('../models')
const transactions = db.transactions
const transaction_details = db.transaction_details
const products = db.products
const Op = db.Sequelize.Op
require('dotenv').config()

// Retrieve and return all notes from the database.
exports.list = async (req, res) => {
    try {
        const size = +req.query.size || 10;
        const page = +req.query.page || 0;
        const offset = size * page;

        const result = await transactions.findAndCountAll({
            where: {
                deleted: { [Op.eq]: 0 },
                partner_code: { [Op.eq]: req.header("x-partner-code") },
                ...req.query.id && { id: { [Op.in]: req.query.id.split(",") } },
                ...req.query.store_id && { store_id: { [Op.in]: req.query.store_id.split(",") } },
                ...req.query.cashier_id && { cashier_id: { [Op.in]: req.query.cashier_id.split(",") } },
                ...req.query.status && { status: { [Op.eq]: req.query.status } },
                ...req.query.search && {
                    [Op.or]: [
                        { code: { [Op.like]: `%${req.query.search}%` } },
                        { store_name: { [Op.like]: `%${req.query.search}%` } },
                        { cashier_name: { [Op.like]: `%${req.query.search}%` } },
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

exports.listTransactionDetails = async (req, res) => {
    try {
        const size = +req.query.size || 10;
        const page = +req.query.page || 0;
        const offset = size * page;

        const result = await transaction_details.findAndCountAll({
            where: {
                deleted: { [Op.eq]: 0 },
                partner_code: { [Op.eq]: req.header("x-partner-code") },
                ...req.query.id && { id: { [Op.in]: req.query.id.split(",") } },
                ...req.query.trx_code && { trx_code: { [Op.in]: req.query.trx_code.split(",") } },
                ...req.query.search && {
                    [Op.or]: [
                        { product_name: { [Op.like]: `%${req.query.search}%` } },
                        { trx_code: { [Op.like]: `%${req.query.search}%` } },
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
    const t = await db.sequelize.transaction();
    try {
        for (const value of ['store_id', 'store_name', 'cashier_id', 'cashier_name', 'products']) {
            if (!req.body[value]) {
                return res.status(400).send({
                    status: "error",
                    error_message: "Parameter tidak lengkap " + value,
                    code: 400
                });
            }
        }
        let totalQty = 0;
        let totalPrice = 0;
        const listProduct = req.body.products
        const payload = {
            ...req.body,
            partner_code: req.header("x-partner-code"),
            code: generateTransactionCode(),
            qty: totalQty,
            price: totalPrice
        };
        const result = await transactions.create(payload, { transaction: t });
        for (const element of listProduct) {
            const existProduct = await products.findOne({
                where: {
                    deleted: { [Op.eq]: 0 },
                    id: { [Op.eq]: element.id }
                }
            });

            if (!existProduct) {
                await t.rollback();
                return res.status(400).send({ message: "Produk tidak ditemukan!" });
            }

            if (existProduct.stock < element.qty) {
                await t.rollback();
                return res.status(400).send({ message: `Stok produk ${element.name} tidak mencukupi!` });
            }

            await products.update(
                { stock: existProduct.stock - element.qty },
                {
                    where: {
                        deleted: { [Op.eq]: 0 },
                        id: { [Op.eq]: existProduct.id }
                    },
                    transaction: t
                }
            );

            await transaction_details.create({
                transaction_id: result.id,
                trx_code: result.code,
                partner_code: req.header("x-partner-code"),
                product_id: element.id,
                product_name: element.name,
                product_qty: element.qty,
                product_price: element.price,
                product_selling_price: element.selling_price,
                subtotal: existProduct.selling_price * element.qty
            }, { transaction: t });

            totalQty += element.qty;
            totalPrice += existProduct.selling_price * element.qty;
        }


        await transactions.update({ qty: totalQty, price: totalPrice }, {
            where: {
                deleted: { [Op.eq]: 0 },
                id: { [Op.eq]: result.id }
            },
            transaction: t
        })
        await t.commit();
        return res.status(200).send({
            status: "success",
            items: result,
            code: 200
        })
    } catch (error) {
        await t.rollback();
        console.log(error);
        res.status(500).send({ message: "Server mengalami gangguan!", error: error })
        return
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await transactions.findOne({
            where: {
                deleted: { [Op.eq]: 0 },
                id: { [Op.eq]: req.body.id }
            }
        })
        if (!result) {
            return res.status(400).send({ message: "Data tidak ditemukan!" })
        }
        result.deleted = 1
        res.status(200).send({ message: "Berhasil ubah data" })
        return
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Gagal mendapatkan data", error: error })
    }
}