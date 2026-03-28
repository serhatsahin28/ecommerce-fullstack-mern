
const Users = require('../models/users');
const Orders = require('../models/orders');


const viewOrders = async (req, res) => {

    const userMail = "qd@gmail.com";

    const query = await Orders.find({ email: userMail });
    console.log("query", query);
    res.json({
        query, message: "Success"
    });
}

module.exports = viewOrders;