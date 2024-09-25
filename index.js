let express = require("express")
let mongoose = require("mongoose")
let axios = require("axios")
const route = require("./routing/prodroute")
let app = express()
let cors = require("cors")
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb://localhost:27017/prod").then(()=>{
    console.log("database connected")
}).catch(()=>{
    console.log("Connection Failed")
})

app.use("/", route)
app.listen(5000)