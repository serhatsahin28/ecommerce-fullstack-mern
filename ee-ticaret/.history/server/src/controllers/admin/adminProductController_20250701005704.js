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
    let productData = req.body;
    console.log("productData:", JSON.stringify(productData, null, 2));
    console.log("req.files:", req.files);
    
    // MongoDB bağlantısını kontrol et
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB connection state:', mongoose.connection.readyState);
      return res.status(500).json({ 
        message: "Veritabanı bağlantısı mevcut değil",
        connectionState: mongoose.connection.readyState 
      });
    }

    // translations string geldiyse objeye çevir
    if (typeof productData.translations === 'string') {
      try {
        productData.translations = JSON.parse(productData.translations);
      } catch (e) {
        return res.status(400).json({ message: "Geçersiz translations JSON formatı." });
      }
    }

    // Resim işleme
    let allImages = [];
    
    if (req.files && req.files.mainImage && req.files.mainImage.length > 0) {
      const mainImagePath = `/images/${req.files.mainImage[0].filename}`;
      allImages.push(mainImagePath);
      productData.image = mainImagePath;
      console.log("Ana resim eklendi:", mainImagePath);
    }
    
    if (req.files && req.files.images && req.files.images.length > 0) {
      const additionalImages = req.files.images.map(f => `/images/${f.filename}`);
      allImages = allImages.concat(additionalImages);
      console.log("Ek resimler eklendi:", additionalImages);
    }
    
    if (allImages.length > 0) {
      productData.images = allImages;
      console.log("Toplam resimler:", allImages);
    }

    // Veri tiplerini düzelt
    productData.price = parseFloat(productData.price);
    productData.rating = parseFloat(productData.rating);

    delete productData.imageFile;
    delete productData.newImageFiles;

    console.log("Final productData:", JSON.stringify(productData, null, 2));

    // Timeout ile save işlemi
    const newProduct = new products(productData);
    
    const savedProduct = await Promise.race([
      newProduct.save(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Save işlemi timeout')), 15000)
      )
    ]);

    console.log("✅ Product saved successfully:", savedProduct._id);

    res.status(201).json({
      message: "Ürün başarıyla eklendi",
      product: savedProduct
    });

  } catch (err) {
    console.error("❌ addProduct error:", err);
    
    if (err.name === 'MongooseError' || err.message.includes('buffering timed out')) {
      res.status(500).json({ 
        message: "Veritabanı bağlantı hatası. MongoDB servisinin çalıştığından emin olun.",
        error: "Database connection timeout"
      });
    } else {
      res.status(500).json({ 
        message: "Sunucu hatası", 
        error: err.message 
      });
    }
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
