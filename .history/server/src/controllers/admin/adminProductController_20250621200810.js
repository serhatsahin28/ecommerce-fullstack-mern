const products = require('../../models/products');

// Tüm ürünleri listele
console.log("asdad");
const getProductsList = async (req, res) => {
  try {
console.log("rrr");
    const data = await products.find().lean();
    if (!data) return res.status(404).json({ message: 'No data found.' });
    res.json(data);
    console.log(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = {
  getProductsList
};
