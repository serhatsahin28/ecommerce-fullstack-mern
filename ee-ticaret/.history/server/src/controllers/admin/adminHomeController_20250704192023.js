const products = require('../../models/products');
const home = require('../../models/home');

// Tüm ürünleri listeleme

const getHomeList = async (req, res) => {
  try {
    // Verileri paralel olarak çekerek performansı artır
    const [homeData, productData] = await Promise.all([
      home.find().lean(),
      products.find().lean()
    ]);

    // Hem homeData hem de productData boşsa hata döndür
    if ((!homeData || homeData.length === 0) && (!productData || productData.length === 0)) {
      return res.status(404).json({ message: 'No data found.' });
    }

    // Başarılı cevap
    return res.status(200).json({ homeData, productData });
  } catch (err) {
    console.error('Error fetching data:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



const updateHomeList = async (req, res) => {
  try {
    // Verileri paralel olarak çekerek performansı artır
    const [homeData, productData] = await Promise.all([
      home.find().lean(),
      products.find().lean()
    ]);

    // Hem homeData hem de productData boşsa hata döndür
    if ((!homeData || homeData.length === 0) && (!productData || productData.length === 0)) {
      return res.status(404).json({ message: 'No data found.' });
    }

    // Başarılı cevap
    return res.status(200).json({ homeData, productData });
  } catch (err) {
    console.error('Error fetching data:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};






module.exports = {getHomeList}
