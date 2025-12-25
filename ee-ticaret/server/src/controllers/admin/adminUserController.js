const Users = require('../../models/users');

const userAll = async (req, res) => {

    try {
        const userAll = await Users.find();
        res.json(userAll);
    } catch (error) {
        console.log(error);
    }

}


module.exports = userAll;