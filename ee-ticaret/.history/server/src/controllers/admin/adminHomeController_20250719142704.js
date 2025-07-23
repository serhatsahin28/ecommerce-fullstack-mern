const products = require('../../models/products');
const mongoose = require("mongoose");
const home = require('../../models/home');

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





const saveHomePageData = async (req, res) => {
  try {
    const homePageId = req.params.id;
    const updatedData = req.body;
    const file = req.file;

    console.log(updatedData);
    if (!homePageId || !updatedData) {
      return res.status(400).json({ message: 'Geçersiz veri veya ID.' });
    }

    // Gelen güncel veriyi veritabanında güncelle
    await home.findByIdAndUpdate(homePageId, updatedData);

    res.status(200).json({ message: 'Anasayfa verileri başarıyla kaydedildi!' });

  } catch (err) {
    console.error('Anasayfa kaydetme hatası:', err);
    res.status(500).json({ message: 'Sunucuda bir hata oluştu, kaydetme başarısız.' });
  }
};


// Resim yükleme işlemi
const uploadHomeImage = async (req, res) => {
  try {
    const file = req.file;
    const homePageId = req.params.id;
    const { sliderId } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'Lütfen bir resim dosyası seçin.' });
    }

    if (!homePageId || !mongoose.Types.ObjectId.isValid(homePageId)) {
      return res.status(400).json({ message: 'Geçersiz sayfa ID.' });
    }

    if (!sliderId || !mongoose.Types.ObjectId.isValid(sliderId)) {
      return res.status(400).json({ message: 'Geçersiz slider ID.' });
    }

    const imagePath = `/images/${file.filename}`;

    // Sayfa dokümanını getir
    const homeDoc = await home.findById(homePageId);
    if (!homeDoc) {
      return res.status(404).json({ message: 'Anasayfa bulunamadı.' });
    }

    // slider_id ile heroSlides içinde doğru slaytı bul ve image güncelle
    const targetSlide = homeDoc.heroSlides.find(slide =>
      slide.slider_id.toString() === sliderId
    );

    if (!targetSlide) {
      return res.status(404).json({ message: 'Slayt bulunamadı.' });
    }

    targetSlide.image = imagePath;

    // Değişiklikleri kaydet
    await homeDoc.save();

    res.status(200).json({
      message: 'Slayt resmi başarıyla güncellendi!',
      imagePath,
      sliderId
    });

  } catch (err) {
    console.error('Slayt resmi yükleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası, resim yüklenemedi.' });
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

   

    const sliderItem = homeDoc.heroSliders[index];
    console.log(sliderItem);
   


    // await homeDoc.save();

    res.status(200).json({ message: 'Slider başarıyla silindi.' });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};



module.exports = { getHomeList, updateHomeList, saveHomePageData, uploadHomeImage, deleteItem }
