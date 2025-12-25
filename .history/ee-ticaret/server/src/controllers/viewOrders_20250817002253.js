
const Users = require('../models/users');
const Orders = require('../models/orders');


const viewOrders = async (req, res) => {

    const userMail = "qd@gmail.com";

    const query = await Orders.findOne({ email:userMail });
    console.log("query",query);
res.json({
    query,success
});
}

module.exports = viewOrders;