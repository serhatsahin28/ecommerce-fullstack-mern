const User = require('../models/users'); // Model dosyanızın yolu farklıysa düzeltin.

const updateAddressController = async (req, res) => {
  try {
    const userId = req.user.id; // Bu bilgi auth middleware'den geliyor.
    
    // Frontend'den gelen adres bilgilerini alıyoruz.
    const { adres_detay, sehir, ilce, posta_kodu } = req.body;

    // Kullanıcıyı bul ve sadece adresini güncelle.
    // Bu yöntem, diğer profil bilgilerinin (ad, soyad, email vb.) etkilenmemesini sağlar.
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        // $set operatörü ile sadece adresler dizisini güncelliyoruz.
        $set: {
          adresler: [{
            adres_detay: adres_detay || '',
            sehir: sehir || '',
            ilce: ilce || '',
            posta_kodu: posta_kodu || ''
          }]
        }
      },
      // { new: true } seçeneği, metodun güncellenmiş kullanıcı verisini döndürmesini sağlar.
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json({ 
      message: 'Adres bilgileri başarıyla güncellendi.',
      adres: updatedUser.adresler[0] // Güncellenmiş adresi geri gönder
    });

  } catch (err) {
    console.error('Adres güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası, adres güncellenemedi.' });
  }
};

module.exports = 
  updateAddressController
;