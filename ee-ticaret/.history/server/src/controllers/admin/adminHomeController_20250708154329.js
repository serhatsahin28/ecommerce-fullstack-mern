const products = require('../../models/products');
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
    const sliderId = req.body.sliderId;  // sliderId'yi formData'dan alıyoruz

    if (!file) {
      return res.status(400).json({ message: 'Lütfen bir resim dosyası seçin.' });
    }

    console.log("sliderId:",sliderId);
    console.log("homePageId:",homePageId);
    console.log("file:",file);

    if (!homePageId || !sliderId) {
      return res.status(400).json({ message: 'Geçersiz veya eksik ID.' });
    }

    
    const imagePath = '/images/' + file.filename;

    // Önce anasayfa dokümanını bulalım
    const homeDoc = await home.findById(homePageId);
    if (!homeDoc) {
      return res.status(404).json({ message: 'Anasayfa bulunamadı.' });
    }

    // heroSlides dizisindeki ilgili slider'ı bulup image'i güncelle
    // heroSlides dizisinde sliderId ile eşleşen öğeyi bul
const slider = homeDoc.heroSlides.find(s => s.slider_id === sliderId);

   if (!slider) {
  return res.status(404).json({ message: 'Slider bulunamadı.' });
}

slider.image = imagePath;

await homeDoc.save();

    res.status(200).json({
      message: 'Slide resmi başarıyla yüklendi!',
      imagePath
    });

  } catch (err) {
    console.error('Slayt resmi yükleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası, resim yüklenemedi.' });
  }
};




module.exports = { getHomeList, updateHomeList, saveHomePageData, uploadHomeImage }
