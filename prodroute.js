let express = require("express")
const { initializeDatabase, getAllProducts, getTransactions, getBarChartData, getPieChartData, getCombinedData, getSalesStatistics } = require("../controler/prodcon")

let route = new express.Router()

route.get("/transaction",initializeDatabase)
route.get("/getprod",getAllProducts)
route.get('/pagination', getTransactions)
route.get("/stats",getSalesStatistics)
route.get("/barchart", getBarChartData)
route.get("/piechart",getPieChartData)
route.get("/combined",getCombinedData)

module.exports = route