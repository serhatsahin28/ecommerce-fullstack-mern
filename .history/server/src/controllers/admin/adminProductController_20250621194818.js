const products = require('../../models/products');

// Tüm ürünleri listele
const getProductsList = async (req, res) => {
  try {
    const data = await products.find().lean();
    if (!data) return res.status(404).json({ message: 'No data found.' });
    res.json(data);
    console.log(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Ürünü güncelle (PUT /admin/products/:id)
// const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     const updatedProduct = await products.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
//     if (!updatedProduct) return res.status(404).json({ message: 'Product not found.' });

//     res.json(updatedProduct);
//   } catch (err) {
//     console.error('Error updating product:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

module.exports = {
  getProductsList
//   updateProduct,
};
