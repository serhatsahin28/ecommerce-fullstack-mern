const users = require('../models/users');
const bcrypt = require('bcryptjs');

const updateProfileController = async (req, res) => {
  try {
    const userId = req.user.id; // Bu bilgi auth middleware'den geliyor olmalı.

    // Sadece adres bilgilerini body'den alıyoruz. Diğer bilgiler (ad, soyad vb.) gelirse yok sayılacak.
    const { adres_detay, sehir, ilce, posta_kodu } = req.body;

    // Alanların en az birinin dolu olduğunu kontrol edelim (isteğe bağlı)
    if (!adres_detay && !sehir && !ilce) {
      return res.status(400).json({ message: 'Lütfen en azından adres detayı, şehir ve ilçe bilgilerini girin.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Kullanıcının adresler dizisini yeni adresle güncelliyoruz.
    // Bu yapı, kullanıcının sadece bir adresi olacağı varsayımına dayanır.
    // Eğer birden fazla adres yönetmek isterseniz bu kısım değişmelidir.
    user.adresler = [
      {
        adres_detay: adres_detay || '',
        sehir: sehir || '',
        ilce: ilce || '',
        posta_kodu: posta_kodu || ''
      }
    ];

    // Değişiklikleri veritabanına kaydet.
    await user.save();

    // Cevap olarak güncellenmiş adresi ve başarı mesajını dönebiliriz.
    res.status(200).json({
      message: 'Adres başarıyla güncellendi.',
      adres: user.adresler[0]
    });

  } catch (err) {
    console.error('Adres güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası. Adres güncellenemedi.' });
  }
}
module.exports = updateProfileController;
