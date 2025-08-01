const products = require('../../models/products');

// Tüm ürünleri listeleme

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



// Id'si belirtilen ürünün güncellenmesi
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    // Eğer dosya (resim) varsa, yolunu ekle
    if (req.file) {
      const image = req.file.filename;
      const newImagePath = "/images/" + image;
      updateData.image = newImagePath;
    }

    // Güncelleme işlemi
    const updatedProduct = await products.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    res.status(200).json({
      message: 'Ürün başarıyla güncellendi',
      product: updatedProduct
    });

  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};


module.exports =
  { getProductsList, updateProduct }
  ;
