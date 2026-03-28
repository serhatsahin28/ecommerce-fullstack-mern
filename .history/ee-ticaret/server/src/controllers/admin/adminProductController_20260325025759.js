const products = require('../../models/products');
const home = require('../../models/home');

// Tüm ürünleri listeleme

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




const addProduct = async (req, res) => {
  try {
    let productData = req.body;
    const files = req.files || [];
    let finalVariants = [];

    // 1. JSON PARSE İŞLEMLERİ
    if (typeof productData.translations === 'string') {
      productData.translations = JSON.parse(productData.translations);
    }

    // 2. VARYANT TİPİNE GÖRE İŞLEME
    const variantType = productData.variantType; // 'none', 'size', 'color'

    if (variantType === 'size') {
      // SADECE BEDEN MODU: Veri zaten düz liste olarak gelir
      finalVariants = typeof productData.variants === 'string' ? JSON.parse(productData.variants) : [];

      // Resimler bu modda ana resimlerdir, varyant içinde resim olmaz (isteğe bağlı)
    }
    else if (variantType === 'color') {
      const rawVariants = typeof productData.variants === 'string'
        ? JSON.parse(productData.variants)
        : [];

      // Resimleri ekle
      rawVariants.forEach((variant, idx) => {
        const groupImages = [];
        // Renk adına göre resim gruplarını bul
        const gIdx = rawVariants
          .filter((v, i) => i < idx && v.color_name === variant.color_name).length === 0
          ? rawVariants.findIndex(v => v.color_name === variant.color_name)
          : -1;

        for (let i = 0; i < 4; i++) {
          const colorIdx = [...new Set(rawVariants.map(v => v.color_name))].indexOf(variant.color_name);
          const fieldName = `color_${colorIdx}_img_${i}`;
          const foundFile = files.find(f => f.fieldname === fieldName);
          if (foundFile) groupImages.push(`/images/${foundFile.filename}`);
        }

        finalVariants.push({
          variant_id: `${Date.now()}_${idx}`,
          sku: variant.sku || '',
          size: variant.size || '',
          stock: Number(variant.stock) || 0,
          color_name: variant.color_name || '',
          color_code: variant.color_code || '',
          images: groupImages,
          price: Number(productData.price) || 0
        });
      });
    }
    // A. Bu renk grubuna ait 4 resmi bul
    const groupImages = [];
    for (let i = 0; i < 4; i++) {
      const fieldName = `color_${gIdx}_img_${i}`; // MODAL'daki isimlendirme
      const foundFile = files.find(f => f.fieldname === fieldName);
      if (foundFile) {
        groupImages.push(`/images/${foundFile.filename}`);
      }
    }

    // B. Bu renk grubundaki her bir bedeni ayrı bir varyant olarak düz listeye ekle
    group.sizes.forEach(sizeItem => {
      finalVariants.push({
        variant_id: sizeItem.id || `v_${Date.now()}`,
        sku: sizeItem.sku,
        size: sizeItem.size,
        stock: Number(sizeItem.stock) || 0,
        color_name: group.color_name,
        color_code: group.color_code,
        images: groupImages, // Aynı resimler bu rengin tüm bedenlerine kopyalanır
        price: Number(productData.price) || 0
      });
    });
  });
}

// 3. GENEL ÜRÜN VERİLERİNİ HAZIRLA
const finalData = {
  category_key: productData.category_key,
  variantType: variantType,
  price: Number(productData.price) || 0,
  translations: productData.translations,
  hasVariants: variantType !== 'none',
  variants: finalVariants
};

// A. Ana Kapak Resmi
const mainImgFile = files.find(f => f.fieldname === 'mainImage');
if (mainImgFile) {
  finalData.image = `/images/${mainImgFile.filename}`;
}

// B. Ekstra Galeri Resimleri (Varyant yoksa kullanılır)
if (variantType !== 'color') {
  const extraImagesArray = [];
  files.forEach(f => {
    if (f.fieldname.startsWith('extraImage_')) {
      extraImagesArray.push(`/images/${f.filename}`);
    }
  });
  finalData.extraImages = extraImagesArray;

  // Standart ürünse stok ve sku'yu kökten al
  if (variantType === 'none') {
    finalData.stock = Number(productData.stock) || 0;
    finalData.sku = productData.sku;
  }
}

// 4. VERİTABANINA KAYIT
const newProduct = new products(finalData); // Şema model adın 'products' ise
const savedProduct = await newProduct.save();

res.status(201).json({
  message: "Ürün başarıyla kaydedildi.",
  product: savedProduct
});

  } catch (err) {
  console.error("Backend Kayıt Hatası:", err);
  res.status(500).json({ message: "Sunucu hatası", error: err.message });
}
};



// Id'si belirtilen ürünün güncellenmesi
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id; // URL'den gelen ID
    const data = req.body;
    const files = req.files || [];

    // 1. Ürünü Veritabanında Bul
    const existingProduct = await products.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Güncellenecek ürün bulunamadı." });
    }

    // 2. JSON Verilerini Parse Et (Hata önleyici bloklar ile)
    let translations = {};
    let colorGroups = [];
    let extraImagesFromFront = [];

    try {
      translations = typeof data.translations === 'string' ? JSON.parse(data.translations) : data.translations;
      if (data.colorGroups) {
        colorGroups = typeof data.colorGroups === 'string' ? JSON.parse(data.colorGroups) : data.colorGroups;
      }
      if (data.extraImages) {
        extraImagesFromFront = typeof data.extraImages === 'string' ? JSON.parse(data.extraImages) : data.extraImages;
      }
    } catch (e) {
      return res.status(400).json({ message: "Veri formatı hatalı (JSON Parse Error)" });
    }

    let finalVariants = [];
    let finalMainImage = existingProduct.image;
    let finalExtraImages = [];

    // 3. Ana Kapak Resmini Güncelle (Yeni dosya geldiyse)
    const mainImgFile = files.find(f => f.fieldname === 'mainImage');
    if (mainImgFile) {
      finalMainImage = `/images/${mainImgFile.filename}`;
    }

    // 4. Varyant / Renk Gruplarını İşle
    const isVariantMode = data.variantType !== 'none';

    if (isVariantMode) {
      colorGroups.forEach((group, gIdx) => {
        let groupImages = [...(group.images || [])]; // Mevcut URL'ler

        // Bu gruba ait yeni yüklenen resimleri fieldname'e göre bul (color_0_img_0 gibi)
        files.forEach(file => {
          if (file.fieldname.startsWith(`color_${gIdx}_img_`)) {
            groupImages.push(`/images/${file.filename}`);
          }
        });

        // Gruba ait bedenleri tekil varyant dizisine çevir
        if (group.sizes && Array.isArray(group.sizes)) {
          group.sizes.forEach(sizeItem => {
            finalVariants.push({
              variant_id: sizeItem.variant_id || `v_${Date.now()}_${Math.random()}`,
              sku: sizeItem.sku || "",
              size: sizeItem.size || "",
              stock: Number(sizeItem.stock) || 0,
              price: Number(sizeItem.price) || 0,
              color_name: group.group_name,
              color_code: group.color_code,
              images: groupImages // Tüm grup aynı resimleri paylaşır
            });
          });
        }
      });
      finalExtraImages = []; // Varyant modundaysak ana ekstra galeriyi temizle
    } else {
      // VARYANTSIZ MOD (Ekstra Galerisi İşleme)
      finalExtraImages = [...extraImagesFromFront]; // Değişmeyen eski resimler
      files.forEach(file => {
        if (file.fieldname.startsWith('extraImage_')) {
          finalExtraImages.push(`/images/${file.filename}`);
        }
      });
      finalVariants = []; // Düz üründe varyantları sil
    }

    // 5. Stok Hesabı
    // Varyant varsa hepsinin toplamı, yoksa manuel girilen değer
    const totalStock = isVariantMode
      ? finalVariants.reduce((sum, v) => sum + v.stock, 0)
      : Number(data.stock) || 0;

    // 6. Güncelleme Objesini Oluştur
    const updateObj = {
      category_key: data.category_key,
      variantType: data.variantType,
      hasVariants: isVariantMode,
      price: Number(data.price) || 0,
      stock: totalStock,
      sku: !isVariantMode ? (data.sku || "") : "",
      image: finalMainImage,
      extraImages: finalExtraImages,
      variants: finalVariants,
      translations: translations
    };

    // 7. Veritabanını Güncelle
    const updatedProduct = await products.findByIdAndUpdate(
      productId,
      { $set: updateObj },
      { new: true }
    );

    // 8. Anasayfa Koleksiyonu Senkronizasyonu
    // Not: 'home' modelinizin şemasına göre 'product_id' kontrolü yapıyoruz.
    try {
      await home.updateMany(
        { "categories.products.product_id": productId },
        {
          $set: {
            "categories.$[].products.$[p].stock": totalStock,
            "categories.$[].products.$[p].price": updateObj.price,
            "categories.$[].products.$[p].image": updateObj.image,
            "categories.$[].products.$[p].name": translations.tr.name
          }
        },
        {
          arrayFilters: [{ "p.product_id": productId }],
          multi: true
        }
      );
    } catch (syncError) {
      console.error("Home sync failed:", syncError.message);
      // Anasayfa senkronu başarısız olsa bile ürün güncellendiği için 200 dönebiliriz.
    }

    // Başarılı yanıt gönder
    res.status(200).json({ success: true, product: updatedProduct });

  } catch (err) {
    console.error("Update Controller Error:", err);
    res.status(500).json({ message: "Sunucu hatası: " + err.message });
  }
};




// Id'si belirtilen ürünün güncellenmesi
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("Silinecek ürün ID:", productId);

    const deletedProduct = await products.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    res.status(200).json({
      message: "Ürün başarıyla silindi.",
      product: deletedProduct
    });

  } catch (err) {
    console.error("Silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};







module.exports =
  { getProductsList, addProduct, updateProduct, deleteProduct };
