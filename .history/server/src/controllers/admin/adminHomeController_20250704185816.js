const products = require('../../models/products');
const products = require('../../models/home');

// Tüm ürünleri listeleme

const getHomeList = async (req, res) => {
  try {
    const homeData = await home.find().lean();
    const productData = await products.find().lean();

    if (!homeData && !productData) return res.status(404).json({ message: 'No data found.' });
    res.json({homeData,productData});
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};








module.exports = {getHomeList}
