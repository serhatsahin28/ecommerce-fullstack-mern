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
console.log("----"+updateData);
// console.log("---- AAFTER");

    let translations = updateData.translations;

    // translations nesne ise, doğrudan kullan, string ise parse et
    if (typeof translations === 'string') {
      try {
        translations = JSON.parse(translations);
      } catch (e) {
        console.error("Translations JSON parse error:", e);
        return res.status(400).json({ message: "Geçersiz translations JSON formatı." });
      }
    }

    // Konsola düzgün görmek için JSON.stringify ile yazdır

    updateData.translations = translations;

    if (req.file) {
      updateData.image = `/images/${req.file.filename}`;
    }

    if (updateData.images && typeof updateData.images === 'string') {
      updateData.images = updateData.images.split(',').map(img => img.trim());
    }

      // const updatedProduct = await products.findByIdAndUpdate(
      //   productId,
      //   { $set: updateData },
      //   { new: true, runValidators: true }
      // );

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
