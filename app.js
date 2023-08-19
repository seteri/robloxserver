const express = require('express')
const app = express()
const productRoutes = require("./api/routes/products")
const morgan = require("morgan")
const bodyParser = require("body-parser")

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use((req, res, next) =>{
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET')
        return res.status(200).json({})
    }
    next()
})


app.use('/products', productRoutes)




module.exports = app
