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
    let updateData = req.body;

    // translations alanını parse et
    if (typeof updateData.translations === 'string') {
      updateData.translations = JSON.parse(updateData.translations);
    }

    if (req.file) {
      updateData.image = `/images/${req.file.filename}`;
    }

    // images dizisini ayır
    if (typeof updateData.images === 'string') {
      updateData.images = updateData.images.split(',');
    }

    const updatedProduct = await products.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    res.status(200).json({
      message: "Ürün başarıyla güncellendi",
      product: updatedProduct
    });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};




module.exports =
  { getProductsList, updateProduct }
  ;
