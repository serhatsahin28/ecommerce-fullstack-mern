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
  const productId = req.params.id;
  let updateData = {};

  // JSON verisini ayrıştır (çünkü FormData ile gelirse string olur)
  if (req.body.data) {
    updateData = JSON.parse(req.body.data);
  }

  // Yeni resim geldiyse, dosya yolunu ekle
  if (req.file) {
    const imagePath = `/uploads/${req.file.filename}`;
    updateData.image = imagePath;
  }

  try {
    const updatedProduct = await products.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' });
    }

    res.status(200).json({
      message: 'Ürün başarıyla güncellendi.',
      product: updatedProduct
    });

  } catch (error) {
    console.error("❌ Güncelleme hatası:", error);
    res.status(500).json({ message: 'Ürün güncellenemedi.', error: error.message });
  }
};


module.exports =
    {getProductsList, updateProduct}
    ;
