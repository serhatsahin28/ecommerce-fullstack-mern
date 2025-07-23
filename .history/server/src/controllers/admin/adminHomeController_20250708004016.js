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
    console.log("file file: ", file);
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
    const homePageId = req.params.id;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'Lütfen bir resim dosyası seçin.' });
    }
    
    // YENİ YAPIYLA TAM UYUMLU YOL:
    // Bu yol, frontend'in resme erişebileceği public yoldur.
    // Örn: /uploads/home/12345-67890.jpg
    const imagePath = `/uploads/home/${file.filename}`;
    
    console.log("Gelen ID:", homePageId);
    console.log("Veritabanına kaydedilecek yol:", imagePath);
    
    // Veritabanını güncelle
    const updatedHome = await home.findByIdAndUpdate(
      homePageId, 
      { image: imagePath }, // DİKKAT: home modelinizdeki alan adının 'image' olduğundan emin olun!
      { new: true } 
    );
    
    if (!updatedHome) {
      console.error(`HATA: Veritabanında ${homePageId} ID'li kayıt bulunamadı.`);
      return res.status(404).json({ message: 'Güncellenecek anasayfa verisi bulunamadı.' });
    }
    
    console.log("Veritabanı başarıyla güncellendi:", updatedHome);

    res.status(200).json({ 
      message: 'Resim başarıyla yüklendi ve kaydedildi!',
      imagePath: imagePath // Frontend'in önizleme yapması için bu yolu gönderiyoruz.
    });
    
  } catch (err) {
    console.error('Resim yükleme ve kaydetme hatası:', err);
    res.status(500).json({ message: 'Sunucu tarafında bir hata oluştu, resim yüklenemedi.' });
  }
};
module.exports = { getHomeList, updateHomeList, saveHomePageData, uploadHomeImage }
