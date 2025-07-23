const products = require('../../models/products');

// Tüm ürünleri listele
console.log("asdad");

const getProductsList = async (req, res) => {
    try {
        console.log("getProductsList: ");
        const data = await products.find().lean();
        if (!data) return res.status(404).json({ message: 'No data found.' });
        res.json(data);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
const updateProduct = async (req, res) => {
    console.log("updateProduct içerisi:");
    const productId = req.params.id;
    const updateData = req.body;

    console.log("productIdproductId: "+productId);
    console.log("updateData JSON:", JSON.stringify(updateData, null, 2));


};


module.exports =
    {getProductsList, updateProduct}
    ;
