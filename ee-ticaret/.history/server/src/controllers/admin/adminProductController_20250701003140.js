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




//veri ekleme

const addProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    let AddData = req.body;
    
    console.log("updateData: "+updateData);
    let translations = updateData.translations;
    console.log("Gelen veri: " + req.body.images);

    // translations nesne ise, doğrudan kullan, string ise parse et
    if (typeof translations === 'string') {
      try {
        translations = JSON.parse(translations);
      } catch (e) {
        console.error("Translations JSON parse error:", e);
        return res.status(400).json({ message: "Geçersiz translations JSON formatı." });
      }
    }

    updateData.translations = translations;

    // Mevcut ürünü al
    const existingProduct = await products.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    // Yüklenen dosyaları kontrol et
    if (req.files && req.files.length > 0) {
      console.log("Yüklenen dosyalar:", req.files.map(f => f.filename));

      // İlk dosya ana resim mi yoksa çoklu resim mi?
      // Eğer sadece 1 dosya varsa ve ana resim güncelleniyorsa
      if (req.files.length === 1 && updateData.imageFile) {
        updateData.image = `/images/${req.files[0].filename}`;
      } else {
        // Çoklu resim yükleme
        const newImagePaths = req.files.map(file => `/images/${file.filename}`);

        // Mevcut resimlerle yeni resimleri birleştir
        const existingImages = existingProduct.images || [];
        updateData.images = [...existingImages, ...newImagePaths];
      }
    }

    // Eğer images string olarak geliyorsa array'e çevir
    if (updateData.images && typeof updateData.images === 'string') {
      updateData.images = updateData.images.split(',').map(img => img.trim());
    }

    // imageFile ve newImageFiles alanlarını temizle (veritabanına kaydedilmemeli)
    delete updateData.imageFile;
    delete updateData.newImageFiles;

    const updatedProduct = await products.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Ürün başarıyla güncellendi",
      product: updatedProduct
    });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};






// Id'si belirtilen ürünün güncellenmesi
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    let updateData = req.body;

    let translations = updateData.translations;
    console.log("Gelen veri: " + req.body.images);

    // translations nesne ise, doğrudan kullan, string ise parse et
    if (typeof translations === 'string') {
      try {
        translations = JSON.parse(translations);
      } catch (e) {
        console.error("Translations JSON parse error:", e);
        return res.status(400).json({ message: "Geçersiz translations JSON formatı." });
      }
    }

    updateData.translations = translations;

    // Mevcut ürünü al
    const existingProduct = await products.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    // Yüklenen dosyaları kontrol et
    if (req.files && req.files.length > 0) {
      console.log("Yüklenen dosyalar:", req.files.map(f => f.filename));

      // İlk dosya ana resim mi yoksa çoklu resim mi?
      // Eğer sadece 1 dosya varsa ve ana resim güncelleniyorsa
      if (req.files.length === 1 && updateData.imageFile) {
        updateData.image = `/images/${req.files[0].filename}`;
      } else {
        // Çoklu resim yükleme
        const newImagePaths = req.files.map(file => `/images/${file.filename}`);

        // Mevcut resimlerle yeni resimleri birleştir
        const existingImages = existingProduct.images || [];
        updateData.images = [...existingImages, ...newImagePaths];
      }
    }

    // Eğer images string olarak geliyorsa array'e çevir
    if (updateData.images && typeof updateData.images === 'string') {
      updateData.images = updateData.images.split(',').map(img => img.trim());
    }

    // imageFile ve newImageFiles alanlarını temizle (veritabanına kaydedilmemeli)
    delete updateData.imageFile;
    delete updateData.newImageFiles;

    const updatedProduct = await products.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

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
  { getProductsList, addProduct, updateProduct, }
  ;
