const products = require('../../models/products');

// Tüm ürünleri listele

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
  const updateData = req.body;

  // console.log("📌 Güncellenmek istenen ID:", productId);
  // console.log("📦 Yeni veri:", JSON.stringify(updateData, null, 2));
  // console.log("updateData::".updateData);
  // try {
  //   const updatedProduct = await products.findByIdAndUpdate(
  //     productId,
  //     { $set: updateData },
  //     { new: true, runValidators: true }
  //   );

  //   if (!updatedProduct) {
  //     return res.status(404).json({ message: 'Ürün bulunamadı.' });
  //   }

  //   res.status(200).json({
  //     message: 'Ürün başarıyla güncellendi.',
  //     product: updatedProduct
  //   });

  // } catch (error) {
  //   console.error("❌ Güncelleme hatası:", error);
  //   res.status(500).json({ message: 'Ürün güncellenemedi.', error: error.message });
  // }
};



const updateProductImg = async (req, res) => {
  try {
    const productId = req.params.id;
    const image = req.file.filename;
    const newImagePath = "/images/" + image;

    console.log("updateProductImg: ", productId);
    const data = await products.findById(productId);
    if (!data) return res.status(404).json({ error: 'Ürün bulunamadı' });

    data.image = newImagePath;
    await data.save();


  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Server error' });
    res.status(200).json({ message: 'Resim güncellendi.', image: imagePath });

  }
};

module.exports =
  { getProductsList, updateProduct, updateProductImg }
  ;
