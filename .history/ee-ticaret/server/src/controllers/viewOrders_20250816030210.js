
const users = require('../models/users');
const orders = require('../models/orders');


const viewOrders = async = (req, res) => {

    const userMail = "qd@gmail.com";

    const query = await orders.findOne({ 'email': userMail });


}

module.exports = viewOrders;