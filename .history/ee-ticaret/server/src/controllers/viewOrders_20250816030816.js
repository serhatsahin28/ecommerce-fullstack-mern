
const Users = require('../models/users');
const Orders = require('../models/orders');


const viewOrders = async (req, res) => {

    const userMail = "qd@gmail.com";

    const query = await Orders.findOne({ userMail });
    console.log(query);

}

module.exports = viewOrders;