
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
                ...req.query.product_id && { product_id: { [Op.in]: req.query.product_id.split(",") } },
                ...req.query.trx_code && { trx_code: { [Op.in]: req.query.trx_code.split(",") } },
                ...req.query.search && {
                    [Op.or]: [
                        { product_name: { [Op.like]: `%${req.query.search}%` } },
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