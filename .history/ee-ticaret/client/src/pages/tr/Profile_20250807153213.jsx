{/* Card Modal */}
        {showCardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Yeni Kart Ekle</h3>
                <button
                  onClick={() => setShowCardModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <span className="w-5 h-5">❌</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kart Tipi</label>
                  <select
                    value={newCard.kart_tipi}
                    onChange={(e) => setNewCard(prev => ({...prev, kart_tipi: e.target.value}))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="American Express">American Express</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kart Numarası</label>
                  <input
                    type="text"
                    value={newCard.kart_numarasi}
                    onChange={(e) => setNewCard(prev => ({...prev, kart_numarasi: e.target.value.replace(/\D/g, '')}))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm sm:text-base"
                    placeholder="1234567890123456"
                    maxLength={16import React, { useState } from 'react';

const ProfileTR = () => {
  // Data from database - gerçek veritabanı verisi kullanılacak
  const [userData, setUserData] = useState({
    ad: "Ayşe",
    soyad: "Demirer",
    email: "a@gmail.com",
    telefon: "+905551112233",
    adresler: [
      {
        adres_tipi: "Ev",
        ulke: "Türkiye",
        sehir: "İstanbul",
        ilce: "Kadıköy",
        posta_kodu: "34730",
        adres_detay: "Fenerbahçe Mah. Çarşı Sok. No:12"
      }
    ],
    odeme_yontemleri: [
      {
        yontem: "Kredi Kartı",
        kart_tipi: "Visa",
        kart_numarasi: "**** **** **** 1234"
      }
    ]
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    adres_tipi: "Ev",
    ulke: "Türkiye",
    sehir: "",
    ilce: "",
    posta_kodu: "",
    adres_detay: ""
  });
  const [newCard, setNewCard] = useState({
    yontem: "Kredi Kartı",
    kart_tipi: "Visa",
    kart_numarasi: ""
  });

  const handleAddAddress = () => {
    if (newAddress.sehir && newAddress.ilce && newAddress.adres_detay) {
      setUserData(prev => ({
        ...prev,
        adresler: [...prev.adresler, { ...newAddress }]
      }));
      setNewAddress({
        adres_tipi: "Ev",
        ulke: "Türkiye",
        sehir: "",
        ilce: "",
        posta_kodu: "",
        adres_detay: ""
      });
      setShowAddressModal(false);
    }
  };

  const handleAddCard = () => {
    if (newCard.kart_numarasi.length >= 16) {
      const maskedCard = "**** **** **** " + newCard.kart_numarasi.slice(-4);
      setUserData(prev => ({
        ...prev,
        odeme_yontemleri: [...prev.odeme_yontemleri, { ...newCard, kart_numarasi: maskedCard }]
      }));
      setNewCard({
        yontem: "Kredi Kartı",
        kart_tipi: "Visa",
        kart_numarasi: ""
      });
      setShowCardModal(false);
    }
  };

  const removeAddress = (index) => {
    setUserData(prev => ({
      ...prev,
      adresler: prev.adresler.filter((_, i) => i !== index)
    }));
  };

  const removeCard = (index) => {
    setUserData(prev => ({
      ...prev,
      odeme_yontemleri: prev.odeme_yontemleri.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-8 border border-slate-200">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
              {userData.ad.charAt(0)}{userData.soyad.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                {userData.ad} {userData.soyad}
              </h1>
              <p className="text-slate-600 text-base sm:text-lg">{userData.email}</p>
              <p className="text-slate-500 text-sm sm:text-base">{userData.telefon}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Adresler Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
                <span className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600">📍</span>
                Adreslerim
              </h2>
              <button
                onClick={() => setShowAddressModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200 shadow-lg text-sm sm:text-base"
              >
                <span className="w-4 h-4">➕</span>
                <span>Yeni Adres</span>
              </button>
            </div>

            <div className="space-y-4">
              {userData.adresler.map((adres, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="w-5 h-5 text-blue-600">📍</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base sm:text-lg">{adres.adres_tipi}</h3>
                    </div>
                    <div className="flex space-x-2 self-end sm:self-start">
                      <button className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <span className="w-4 h-4">✏️</span>
                      </button>
                      <button
                        onClick={() => removeAddress(index)}
                        className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <span className="w-4 h-4">🗑️</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-slate-600 text-sm sm:text-base">
                    <p className="font-medium">{adres.adres_detay}</p>
                    <p>{adres.ilce}, {adres.sehir} {adres.posta_kodu}</p>
                    <p className="text-xs sm:text-sm text-slate-500">{adres.ulke}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kart Bilgileri Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
                <span className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-green-600">💳</span>
                Ödeme Yöntemlerim
              </h2>
              <button
                onClick={() => setShowCardModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200 shadow-lg text-sm sm:text-base"
              >
                <span className="w-4 h-4">➕</span>
                <span>Yeni Kart</span>
              </button>
            </div>

            <div className="space-y-4">
              {userData.odeme_yontemleri.map((kart, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-lg p-4 sm:p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white bg-opacity-5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white bg-opacity-5 rounded-full -ml-8 sm:-ml-12 -mb-8 sm:-mb-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <span className="w-5 h-5">💳</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-base sm:text-lg">{kart.yontem}</h3>
                          <p className="text-slate-300 text-xs sm:text-sm">{kart.kart_tipi}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeCard(index)}
                        className="text-white text-opacity-60 hover:text-opacity-100 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors self-end sm:self-start"
                      >
                        <span className="w-4 h-4">🗑️</span>
                      </button>
                    </div>
                    <div className="font-mono text-lg sm:text-xl tracking-wider mb-4 break-all">
                      {kart.kart_numarasi}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-slate-300 text-xs sm:text-sm">Kart Sahibi</span>
                      <span className="font-medium text-sm sm:text-base">{userData.ad} {userData.soyad}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Yeni Adres Ekle</h3>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <span className="w-5 h-5">❌</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Adres Tipi</label>
                  <select
                    value={newAddress.adres_tipi}
                    onChange={(e) => setNewAddress(prev => ({...prev, adres_tipi: e.target.value}))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="Ev">Ev</option>
                    <option value="İş">İş</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Şehir</label>
                    <input
                      type="text"
                      value={newAddress.sehir}
                      onChange={(e) => setNewAddress(prev => ({...prev, sehir: e.target.value}))}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="İstanbul"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">İlçe</label>
                    <input
                      type="text"
                      value={newAddress.ilce}
                      onChange={(e) => setNewAddress(prev => ({...prev, ilce: e.target.value}))}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Kadıköy"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Posta Kodu</label>
                  <input
                    type="text"
                    value={newAddress.posta_kodu}
                    onChange={(e) => setNewAddress(prev => ({...prev, posta_kodu: e.target.value}))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="34730"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Adres Detayı</label>
                  <textarea
                    value={newAddress.adres_detay}
                    onChange={(e) => setNewAddress(prev => ({...prev, adres_detay: e.target.value}))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 sm:h-24 resize-none text-sm sm:text-base"
                    placeholder="Mahalle, sokak, kapı numarası..."
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="w-full sm:flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-300 transition-colors text-sm sm:text-base"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddAddress}
                  className="w-full sm:flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <span className="w-4 h-4">✅</span>
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Card Modal */}
        {showCardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Yeni Kart Ekle</h3>
                <button
                  onClick={() => setShowCardModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <span className="w-5 h-5">❌</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kart Tipi</label>
                  <select
                    value={newCard.kart_tipi}
                    onChange={(e) => setNewCard(prev => ({...prev, kart_tipi: e.target.value}))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="American Express">American Express</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kart Numarası</label>
                  <input
                    type="text"
                    value={newCard.kart_numarasi}
                    onChange={(e) => setNewCard(prev => ({...prev, kart_numarasi: e.target.value.replace(/\D/g, '')}))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                    placeholder="1234567890123456"
                    maxLength={16}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCardModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddCard}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span className="w-4 h-4">✅</span>
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTR;