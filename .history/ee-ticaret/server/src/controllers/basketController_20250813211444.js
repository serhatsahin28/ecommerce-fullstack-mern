const User = require("../models/users");
const Basket = require('../models/basket');
const Product = require('../models/products');

// Sepete ürün ekle
const basketItemAdd = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Ürün ID ve adet gereklidir.' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Ürün bulunamadı.' });
        }

        let basket = await Basket.findOne({ userId });
        if (!basket) {
            basket = new Basket({ userId, items: [] });
        }

        const existingItem = basket.items.find(item => item.productId.toString() === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            basket.items.push({
                productId: product._id,
                name: {
                    tr: product?.translations?.tr?.name || product.name,
                    en: product?.translations?.en?.name || product.name
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

// Sepetten ürün çıkarma
const basketItemRemove = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        if (!productId) {
            return res.status(400).json({ message: 'Ürün ID gereklidir.' });
        }

        const basket = await Basket.findOne({ userId });
        if (!basket) {
            return res.status(404).json({ message: 'Sepet bulunamadı.' });
        }

        basket.items = basket.items.filter(item => item.productId.toString() !== productId);

        await basket.save();
        res.status(200).json({ message: 'Ürün sepetten çıkarıldı.', basket });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Sepette ürün adedini güncelleme
const basketItemUpdate = async (req, res) => {
    try {
        const { productId, change } = req.body;
        const userId = req.user.id;

        if (!productId || !change) {
            return res.status(400).json({ message: 'Ürün ID ve değişim değeri gereklidir.' });
        }

        const basket = await Basket.findOne({ userId });
        if (!basket) {
            return res.status(404).json({ message: 'Sepet bulunamadı.' });
        }

        const item = basket.items.find(item => item.productId.toString() === productId);
        if (!item) {
            return res.status(404).json({ message: 'Ürün sepetinizde bulunamadı.' });
        }

        item.quantity += change;

        if (item.quantity <= 0) {
            basket.items = basket.items.filter(i => i.productId.toString() !== productId);
        }

        await basket.save();
        res.status(200).json({ message: 'Sepet güncellendi.', basket });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Sepeti tamamen temizleme
const basketClear = async (req, res) => {
    try {
        const userId = req.user.id;

        let basket = await Basket.findOne({ userId });
        if (!basket) {
            return res.status(404).json({ message: 'Sepet bulunamadı.' });
        }

        basket.items = [];
        await basket.save();

        res.status(200).json({ message: 'Sepet temizlendi.', basket });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

module.exports = {
    basketItemAdd,
    basketItemRemove,
    basketItemUpdate,
    basketClear
};
