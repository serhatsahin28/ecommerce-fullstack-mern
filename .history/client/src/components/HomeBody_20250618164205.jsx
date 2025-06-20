import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Eye } from 'lucide-react';

const HomeBody = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('tr');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API'den veri çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/home');
        if (!response.ok) {
          throw new Error('Veri yüklenirken hata oluştu');
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('API hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Slider otomatik geçiş
  useEffect(() => {
    if (currentData?.heroSlides) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => 
          prev === currentData.heroSlides.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [data, selectedLanguage]);

  // Seçili dil verisini al
  const currentData = data.find(item => item.page_language === selectedLanguage);

  // Slider geçiş fonksiyonları
  const nextSlide = () => {
    if (currentData?.heroSlides) {
      setCurrentSlide((prev) => 
        prev === currentData.heroSlides.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevSlide = () => {
    if (currentData?.heroSlides) {
      setCurrentSlide((prev) => 
        prev === 0 ? currentData.heroSlides.length - 1 : prev - 1
      );
    }
  };

  // Yıldız gösterimi
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  // Yükleme durumu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{selectedLanguage === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl mb-4">Hata: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Veri yoksa
  if (!currentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Veri bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dil Seçici */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-end">
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedLanguage('tr')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedLanguage === 'tr' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Türkçe
              </button>
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Slider */}
      <div className="relative h-96 overflow-hidden">
        {currentData.heroSlides?.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{
              background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://via.placeholder.com/1200x400/4f46e5/ffffff?text=${encodeURIComponent(slide.title)}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="text-white max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                <p className="text-lg md:text-xl mb-6 opacity-90">{slide.subtitle}</p>
                <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slider Kontrolleri */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slider Göstergeleri */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {currentData.heroSlides?.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Banner */}
      {currentData.banner && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-4">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-2">{currentData.banner.title}</h2>
            <p className="mb-4">{currentData.banner.desc}</p>
            <button className="bg-white text-red-500 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              {currentData.banner.cta}
            </button>
          </div>
        </div>
      )}

      {/* Ana İçerik */}
      <div className="container mx-auto px-4 py-12">
        {/* Sayfa Başlığı */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {currentData.page_title}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {currentData.page_subtitle}
          </p>
        </div>

        {/* Avantajlar */}
        {currentData.advantages && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {currentData.advantages.map((advantage, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{advantage.icon}</div>
                <p className="font-semibold text-gray-800">{advantage.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* İstatistikler */}
        {currentData.stats && (
          <div className="bg-blue-600 text-white rounded-lg p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {currentData.stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <p className="opacity-90">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kategoriler ve Ürünler */}
        {currentData.categories?.map((category) => (
          <div key={category.category_key} className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{category.title}</h2>
              <button className="text-blue-600 hover:text-blue-800 font-semibold">
                {currentData.view_all}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.products?.map((product) => {
                const productData = product.translations[selectedLanguage];
                return (
                  <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div 
                        className="h-48 bg-gray-200"
                        style={{
                          background: `url('https://via.placeholder.com/300x200/e5e7eb/6b7280?text=${encodeURIComponent(productData?.name || 'Product')}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">{productData?.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{productData?.description}</p>
                      
                      <div className="flex items-center mb-3">
                        <div className="flex mr-2">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-sm text-gray-600">({product.rating})</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-blue-600">₺{product.price}</span>
                        <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeBody;