


const products = require('../../models/products');
const mongoose = require("mongoose");
const home = require('../../models/home');
const storage = require('../../config/firebase'); // firebase.js dosyanın yolu
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
// Tüm ürünleri listeleme

const getHomeList = async (req, res) => {
  try {
    // Verileri paralel olarak çekerek performansı artır
    const [homeData, productData] = await Promise.all([
      home.find().lean(),
      products.find().lean()
    ]);

    // Hem homeData hem de productData boşsa hata döndür
    if ((!homeData || homeData.length === 0) && (!productData || productData.length === 0)) {
      return res.status(404).json({ message: 'No data found.' });
    }

    // Başarılı cevap
    return res.status(200).json({ homeData, productData });
  } catch (err) {
    console.error('Error fetching data:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


const updateHomeList = async (req, res) => {
  try {
    // Verileri paralel olarak çekmeye devam ediyoruz, bu en verimli yöntem.
    const [homeData, productData] = await Promise.all([
      home.find().lean(),
      products.find().lean()
    ]);

    // Veri varlığını kontrol ederken, her birini ayrı ayrı değerlendirmek daha açıklayıcı olabilir.
    // Ancak mevcut mantığınız "her ikisi de boşsa hata ver" diyor ve bu da bir tercih olabilir.
    // Şimdilik sizin mantığınızı koruyoruz.
    if ((!homeData || homeData.length === 0) && (!productData || productData.length === 0)) {
      // Not: Bu durumda bile 200 dönüp boş array'ler göndermek, frontend'de daha kolay yönetilebilir.
      // 404 yerine 200 dönüp, frontend tarafında "Gösterilecek veri bulunamadı" demek daha iyi bir UX olabilir.
      // Ama isteğe bağlı olarak 404 de kalabilir.
      return res.status(200).json({
        message: 'Gösterilecek anasayfa veya ürün verisi bulunamadı.',
        homeData: [],
        productData: []
      });
    }

    // Başarılı cevap
    return res.status(200).json({ homeData, productData });

  } catch (err) {
    // Hata durumunda daha detaylı loglama
    console.error('Anasayfa verileri güncellenirken bir hata oluştu:', err);
    return res.status(500).json({ message: 'Sunucu hatası. Veriler alınamadı.' });
  }
};

// Yeni slider ekleme endpoint'i
const addHeroSlider = async (req, res) => {
  try {
    const homeDoc = await home.findOne();
    if (!homeDoc) return res.status(404).json({ message: 'Anasayfa bulunamadı' });

    const newSlide = {
      slider_id: new mongoose.Types.ObjectId(), // Benzersiz ID
      image: "/images/placeholder.jpg",
      title: { tr: '', en: '' },
      subtitle: { tr: '', en: '' },
      cta: { tr: '', en: '' }
    };

    homeDoc.heroSlides.push(newSlide);
    await homeDoc.save();

    res.status(201).json(newSlide);
  } catch (err) {
    res.status(500).json({ message: 'Slider ekleme hatası: ' + err.message });
  }
};




// Mevcut saveHomePageData fonksiyonunu güncelle
 // adminHomeController.js

const saveHomePageData = async (req, res) => {
    try {
        const homePageId = req.params.id;
        const updatedData = req.body;

        if (!homePageId || !updatedData) {
            return res.status(400).json({ message: 'Geçersiz veri veya ID.' });
        }

        // `findByIdAndUpdate` metoduna `{ new: true }` seçeneğini eklemek,
        // güncelleme sonrası dokümanın son halini geri döndürür.
        const updatedDoc = await home.findByIdAndUpdate(homePageId, updatedData, { new: true, runValidators: true });

        if (!updatedDoc) {
            return res.status(404).json({ message: 'Güncellenecek doküman bulunamadı.' });
        }

        res.status(200).json({
            message: 'Anasayfa verileri başarıyla kaydedildi!',
            updatedData: updatedDoc // Güncellenmiş dokümanı frontend'e gönderiyoruz
        });

    } catch (err) {
        console.error('Anasayfa kaydetme hatası:', err);
        res.status(500).json({ message: 'Sunucuda bir hata oluştu, kaydetme başarısız.' });
    }
};




// const uploadHomeImage = async (req, res) => {
//   try {
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ message: 'Lütfen bir resim dosyası seçin.' });
//     }

//     // Sadece dosya yolunu oluşturup frontend'e geri gönderiyoruz.
//     const imagePath = `/images/${file.filename}`;

//     res.status(200).json({
//       message: 'Resim başarıyla yüklendi.',
//       imagePath: imagePath // Resim yolunu frontend'e iletiyoruz.
//     });

//   } catch (err) {
//     console.error('Resim yükleme hatası:', err);
//     res.status(500).json({ message: 'Sunucu hatası, resim yüklenemedi.' });
//   }
// };



const uploadHomeImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Lütfen bir resim dosyası seçin.' });
    }

    // 1. Firebase'de dosyanın kaydedileceği yer ve isim (Klasör: home)
    const fileName = `home/${Date.now()}-${file.originalname}`;
    const storageRef = ref(storage, fileName);

    // 2. Dosya tipini belirtiyoruz (önemli!)
    const metadata = {
      contentType: file.mimetype,
    };

    // 3. Resmi Firebase'e fırlatıyoruz (MemoryStorage kullandığımız için file.buffer diyoruz)
    await uploadBytes(storageRef, file.buffer, metadata);

    // 4. Firebase'den "herkese açık" internet linkini alıyoruz
    const firebaseUrl = await getDownloadURL(storageRef);

    // 5. Frontend'e artık yerel yol değil, internet linkini gönderiyoruz
    res.status(200).json({
      message: 'Resim başarıyla buluta yüklendi.',
      imagePath: firebaseUrl // ARTIK BU: https://firebasestorage.googleapis.com/...
    });

  } catch (err) {
    console.error('Firebase yükleme hatası:', err);
    res.status(500).json({ message: 'Bulut hatası, resim yüklenemedi.' });
  }
};


const deleteItem = async (req, res) => {
  const { itemId, index } = req.params;
  const indexNum = parseInt(index, 10);

  try {
    const homeDoc = await home.findOne();  // Model adı büyük harfle olmalı

    if (!homeDoc) {
      return res.status(404).json({ message: 'Home verisi bulunamadı.' });
    }

    if (!homeDoc.heroSlides || !Array.isArray(homeDoc.heroSlides)) {
      return res.status(400).json({ message: 'Hero sliders verisi geçersiz.' });
    }

    if (indexNum < 0 || indexNum >= homeDoc.heroSlides.length) {
      return res.status(400).json({ message: 'Geçersiz slider indeksi.' });
    }

    const sliderItem = homeDoc.heroSlides[index];

    // Elemanı çıkar
    homeDoc.heroSlides.splice(indexNum, 1);

    // Kaydet
    await homeDoc.save();

    res.status(200).json({ message: 'Slider başarıyla silindi.' });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

const uploadImageToFirebase = async (file) => {
  if (!file) return null;

  // 1. Resim için benzersiz bir isim oluştur (Örn: products/1712241600-araba.jpg)
  const fileName = `products/${Date.now()}-${file.originalname}`;
  const storageRef = ref(storage, fileName);

  // 2. Resmi Firebase'e yükle (file.buffer kullanarak)
  const metadata = { contentType: file.mimetype };
  await uploadBytes(storageRef, file.buffer, metadata);

  // 3. Resmin internetteki URL'ini al
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

module.exports = { getHomeList, updateHomeList, saveHomePageData, uploadHomeImage, deleteItem,addHeroSlider,uploadImageToFirebase }
