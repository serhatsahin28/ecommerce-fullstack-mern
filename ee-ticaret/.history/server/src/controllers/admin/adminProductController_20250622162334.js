const products = require('../../models/products');
const fs = require('fs');
const path = require('path');

// Tüm ürünleri listele
const getProductsList = async (req, res) => {
  try {
    const data = await products.find().lean();
    if (!data) return res.status(404).json({ message: 'No data found.' });
    res.json(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Ürün güncelle
const updateProduct = async (req, res) => {
  const productId = req.params.id;
  let updateData = {};

  // JSON verisini ayrıştır
  if (req.body.data) {
    updateData = JSON.parse(req.body.data);
  }

  try {
    const existingProduct = await products.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' });
    }

    // Yeni resim geldiyse işle
    if (req.file) {
      const imagePath = `/uploads/${req.file.filename}`;
      updateData.image = imagePath;

      // Eski resmi sil
      if (existingProduct.image) {
        const oldImagePath = path.join(__dirname, '../../public', existingProduct.image);
        fs.unlink(oldImagePath, err => {
          if (err) console.error('❗ Eski resim silinemedi:', err);
        });
      }
    }

    const updatedProduct = await products.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Ürün başarıyla güncellendi.',
      product: updatedProduct,
    });

  } catch (error) {
    console.error("❌ Güncelleme hatası:", error);
    res.status(500).json({ message: 'Ürün güncellenemedi.', error: error.message });
  }
};

module.exports = { getProductsList, updateProduct };
