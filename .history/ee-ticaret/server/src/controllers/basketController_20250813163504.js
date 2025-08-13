const user = require("../models/users");
const Basket = require('../models/basket');

const basketItemAdd = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id; // JWT ile gelen kullanıcı ID'si

        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Ürün ID ve adet gereklidir.' });
        }

        // Ürün bilgilerini product koleksiyonundan çek
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Ürün bulunamadı.' });
        }

        // Sepeti bul veya oluştur
        let basket = await Basket.findOne({ userId });

        if (!basket) {
            basket = new Basket({ userId, items: [] });
        }

        // Ürün zaten sepette mi?
        const existingItem = basket.items.find(item => item.productId.toString() === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            basket.items.push({
                productId: product._id,
                name: {
                    tr: product.name.tr,
                    en: product.name.en
                },
                price: product.price,
                image: product.image,
                quantity,
                addedAt: new Date()
            });
        }

        await basket.save();

        res.status(200).json({ message: 'Ürün sepete eklendi.', basket });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

module.exports = { basketItemAdd };




}



module.exports = { basketItemAdd };