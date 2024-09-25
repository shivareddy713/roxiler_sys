let axios = require("axios")
const prodmodel = require("../model/prodmodel")
const initializeDatabase = async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json')
        const products = response.data

        await prodmodel.deleteMany()
        await prodmodel.insertMany(products)

        res.json({ message: 'Database initialized with seed data.' })
    } catch (error) {
        res.json({ message: 'Error initializing the database.' })
    }
}

const getAllProducts = async (req, res) => {
    try {
        const products = await prodmodel.find()
        res.json(products)
    } catch (error) {
        res.json({ message: 'Error fetching products.' })
    }
}

const getTransactions = async (req, res) => {
    try {
        const { search, page = 1, perPage = 10 } = req.query
        const currentPage = parseInt(page)
        const itemsPerPage = parseInt(perPage)

        let query = {}

        if (search) {
            const searchRegex = new RegExp(search, 'i')
            query = {
                $or: [
                    { title: { $regex: searchRegex } },
                    { description: { $regex: searchRegex } },
                    { price: { $regex: searchRegex } }
                ]
            }
        }

        const products = await prodmodel.find(query)
            .skip((currentPage - 1) * itemsPerPage)
            .limit(itemsPerPage)

        const totalProducts = await prodmodel.countDocuments(query)

        res.json({
            page: currentPage,
            perPage: itemsPerPage,
            totalRecords: totalProducts,
            totalPages: Math.ceil(totalProducts / itemsPerPage),
            products
        })
    } catch (error) {
        res.json({ message: 'Error fetching transactions.' })
    }
}

const getSalesStatistics = async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.json({ message: "Month is required." });
        }

        const startOfMonth = new Date();
        startOfMonth.setMonth(parseInt(month) - 1);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const soldItems = await prodmodel.find({
            sold: true,
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, parseInt(month)]
            }
        });

        const unSoldItems = await prodmodel.find({
            sold: false,
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, parseInt(month)]
            }
        });

        const totalSaleAmount = soldItems.reduce((total, item) => total + item.price, 0);
        const totalSoldItems = soldItems.length;
        const totalUnSoldItems = unSoldItems.length;

        res.json({
            totalSaleAmount,
            totalSoldItems,
            totalUnSoldItems,
        });
    } catch (error) {
        res.json({ message: 'Error getting sales statistics.' });
    }
}

const getBarChartData = async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.json({ message: "Month is required." });
        }

        const startDate = new Date(`2000-${month}-01`)
        const endDate = new Date(`2000-${month}-01`)
        endDate.setMonth(endDate.getMonth() + 1)

        const barChartData = await prodmodel.aggregate([
            {
                $addFields: {
                    soldMonth: { $month: "$dateOfSale" }
                }
            },
            {
                $match: {
                    soldMonth: parseInt(month),
                    sold: true,
                }
            },
            {
                $bucket: {
                    groupBy: "$price",
                    boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901],
                    default: "901-above",
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        res.json(barChartData);
    } catch (error) {
        res.json({ message: 'Error generating bar chart data.' });
    }
}

const getPieChartData = async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.json({ message: "Month is required." });
        }

        const startDate = new Date(`2000-${month}-01`);
        const endDate = new Date(`2000-${month}-01`);
        endDate.setMonth(endDate.getMonth() + 1);

        const pieChartData = await prodmodel.aggregate([
            {
                $addFields: {
                    soldMonth: { $month: "$dateOfSale" }
                }
            },
            {
                $match: {
                    soldMonth: parseInt(month),
                    sold: true,
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedData = pieChartData.map(item => ({
            category: item._id,
            items: item.count
        }));

        res.json(formattedData);
    } catch (error) {
        res.json({ message: 'Error generating pie chart data.' });
    }
}

const getCombinedData = async (req, res) => {
    try {
        const { month } = req.query;

        if (!month) {
            return res.json({ message: "Month is required." });
        }

        const statsResponse = await axios.get(`http://localhost:5000/stats/?month=${month}`);
        const statistics = statsResponse.data;

        const barChartResponse = await axios.get(`http://localhost:5000/barchart?month=${month}`);
        const barChartData = barChartResponse.data;

        const pieChartResponse = await axios.get(`http://localhost:5000/piechart?month=${month}`);
        const pieChartData = pieChartResponse.data;

        const combinedResponse = {
            statistics,
            barChartData,
            pieChartData,
        };

        res.json(combinedResponse);
    } catch (error) {
        res.json({ message: 'Error fetching combined data.' });
    }
};


module.exports = {
    initializeDatabase,
    getAllProducts,
    getTransactions,
    getSalesStatistics,
    getBarChartData,
    getPieChartData,
    getCombinedData
}