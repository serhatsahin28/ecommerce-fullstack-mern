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

const uploadSlideImage = async (req, res) => {
  try {
    const { id: homePageId, slideIndex } = req.params;
    const file = req.file;

    // 1. Temel girdi kontrolleri
    if (!file) {
      return res.status(400).json({ message: 'Lütfen bir resim dosyası seçin.' });
    }
    const index = parseInt(slideIndex, 10); // Gelen index'i sayıya çevir
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ message: 'Geçersiz slayt index\'i. Index pozitif bir sayı olmalıdır.' });
    }

    // 2. VERİTABANI KONTROLÜ: Güncelleme yapmadan önce dökümanı bulalım
    const homePageDoc = await home.findById(homePageId);

    if (!homePageDoc) {
      return res.status(404).json({ message: 'Belirtilen ID ile anasayfa verisi bulunamadı.' });
    }

    // 3. heroSlides DİZİSİNİ VE INDEX'İ KONTROL ETME
    // Dökümanda 'heroSlides' alanı var mı ve bu bir dizi mi?
    if (!homePageDoc.heroSlides || !Array.isArray(homePageDoc.heroSlides)) {
      return res.status(400).json({ message: 'Bu kayıtta güncellenecek bir "heroSlides" dizisi bulunamadı.' });
    }
    
    // Gönderilen index, dizinin sınırları içinde mi?
    if (index >= homePageDoc.heroSlides.length) {
      return res.status(400).json({ 
        message: `Geçersiz slayt index'i: ${index}. Bu kayıtta sadece ${homePageDoc.heroSlides.length} adet slayt bulunmaktadır (index 0 ile ${homePageDoc.heroSlides.length - 1} arası geçerlidir).`
      });
    }

    // Artık her şeyin yolunda olduğunu biliyoruz.
    console.log(`Kontrol başarılı: ${homePageId} ID'li dökümanın ${index}. slaytı güncellenecek.`);

    // 4. Resim yolunu oluştur
    const imagePath = `/uploads/home/${file.filename}`;
    
    // 5. Veritabanını güncelle
    const updateField = `heroSlides.${index}.image`;
    
    // Zaten dökümanı bulduğumuz için tekrar findByIdAndUpdate kullanmak yerine
    // dökümanı direkt güncelleyip kaydedebiliriz. Bu da bir yöntemdir.
    // Ancak findByIdAndUpdate daha atomik ve pratiktir, o yüzden onu kullanmaya devam edelim.
    const updatedHome = await home.findByIdAndUpdate(
      homePageId,
      { $set: { [updateField]: imagePath } },
      { new: true }
    );
    
    // 6. Başarılı yanıt gönder
    res.status(200).json({
      message: `Slayt ${index + 1} resmi başarıyla yüklendi ve kaydedildi!`,
      imagePath: imagePath
    });

  } catch (err) {
    console.error('Slayt resmi yükleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası, resim yüklenemedi.' });
  }
};
module.exports = { getHomeList, updateHomeList, saveHomePageData, uploadHomeImage }
