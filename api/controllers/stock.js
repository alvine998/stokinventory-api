
const db = require('../models')
const stocks = db.stocks
const products = db.products
const stores = db.stores
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

// exports.listProductExpired = async (req, res) => {
//     try {
//         const size = +req.query.size || 10;
//         const page = +req.query.page || 0;
//         const offset = size * page;

//         const result = await stocks.findAndCountAll({
//             where: {
//                 deleted: { [Op.eq]: 0 },
//                 partner_code: { [Op.eq]: req.header("x-partner-code") },
//                 ...req.query.id && { id: { [Op.in]: req.query.id.split(",") } },
//                 ...req.query.store_id && { store_id: { [Op.in]: req.query.store_id.split(",") } },
//                 ...req.query.status && { status: { [Op.eq]: req.query.status } },
//                 ...req.query.search && {
//                     [Op.or]: [
//                         { store_name: { [Op.like]: `%${req.query.search}%` } }
//                     ]
//                 },
//             },
//             order: [
//                 ['created_on', 'DESC'],
//             ],
//             attributes: { exclude: ['deleted'] },
//             ...req.query.pagination == 'true' && {
//                 limit: size,
//                 offset: offset
//             }
//         })
//         return res.status(200).send({
//             status: "success",
//             items: result.rows,
//             total_items: result.count,
//             total_pages: Math.ceil(result.count / size),
//             current_page: page,
//             code: 200
//         })
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({ message: "Server mengalami gangguan!", error: error })
//         return
//     }
// };

exports.create = async (req, res) => {
    try {
        ['products', 'qty', 'date', 'type']?.map(value => {
            if (!req.body[value]) {
                return res.status(400).send({
                    status: "error",
                    error_message: "Parameter tidak lengkap " + value,
                    code: 400
                })
            }
        })
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
            if (req.body.type == "out") {
                const onUpdate = await products.update({ stock: existProduct.stock - req.body.qty }, {
                    where: {
                        deleted: { [Op.eq]: 0 },
                        id: { [Op.eq]: existProduct.id }
                    }
                })
            } else {
                const onUpdate = await products.update({ stock: existProduct.stock + req.body.qty }, {
                    where: {
                        deleted: { [Op.eq]: 0 },
                        id: { [Op.eq]: existProduct.id }
                    }
                })
            }
        });
        if (req.body.type == "out") {
            const existStore = await stores.findOne({
                where: {
                    deleted: { [Op.eq]: 0 },
                    id: { [Op.eq]: req.body.store_id }
                }
            })
            if (!existStore) {
                return res.status(400).send({ message: "Toko tidak ditemukan!" })
            }
        }

        const payload = {
            ...req.body,
            partner_code: req.header("x-partner-code")
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

exports.delete = async (req, res) => {
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
            updated_on: new Date(),
            deleted: 1
        }
        const onUpdate = await stocks.update(payload, {
            where: {
                deleted: { [Op.eq]: 0 },
                id: { [Op.eq]: req.body.id }
            }
        })

        for (const element of req.body.products) {

            const existProduct = await products.findOne({
                where: {
                    deleted: { [Op.eq]: 0 },
                    id: { [Op.eq]: element.id }
                }
            });

            if (!existProduct) {
                return res.status(400).send({ message: "Produk tidak ditemukan!" })
            }

            // Safe to access existProduct.stock since existProduct is not null
            if (result.type === "out") {
                existProduct.stock += result.qty;
            } else {
                existProduct.stock -= result.qty;
            }

            await existProduct.save();
        }
        res.status(200).send({ message: "Berhasil ubah data", update: onUpdate })
        return
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Gagal mendapatkan data", error: error })
    }
}