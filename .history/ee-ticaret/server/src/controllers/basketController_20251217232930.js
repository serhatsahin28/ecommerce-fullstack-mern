const User = require("../models/users");
const Basket = require('../models/basket');
const Product = require('../models/products');

// Sepete ürün ekle
const basketItemAdd = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;
        console.log(req.body);
        console.log('basketItemAdd called:', { productId, quantity, userId }); // Debug

        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Ürün ID ve adet gereklidir.' });
        }

        console.log('Searching for product with ID:', productId); // Debug

        const product = await Product.findById(productId);
        console.log('Found product:', product ? 'YES' : 'NO'); // Debug

        if (!product) {
            console.log('Product not found in database'); // Debug
            return res.status(404).json({ message: 'Ürün bulunamadı.' });
        }
        // 🔴 Stok kontrolü
        if (product.stock < 1) {
            return res.status(400).json({
                message: 'Bu ürün stokta yok.'
            });
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
        console.log('Basket saved successfully'); // Debug
        res.status(200).json({ message: 'Ürün sepete eklendi.', basket });

    } catch (error) {
        console.error('basketItemAdd error:', error);
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

        console.log('Update request:', { productId, change, userId }); // Debug

        if (!productId || change === undefined) {
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

        console.log('Before update:', { currentQuantity: item.quantity, change }); // Debug

        // Sadece bir kere change ekle
        item.quantity += change;

        console.log('After update:', { newQuantity: item.quantity }); // Debug

        if (item.quantity <= 0) {
            basket.items = basket.items.filter(i => i.productId.toString() !== productId);
            console.log('Item removed from basket'); // Debug
        }

        await basket.save();
        res.status(200).json({ message: 'Sepet güncellendi.', basket });

    } catch (error) {
        console.error('basketItemUpdate error:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Sepeti tamamen temizleme - DÜZELTME
const basketClear = async (req, res) => {
    try {
        const userId = req.user.id;

        // Sadece bu kullanıcının sepetini temizle
        const basket = await Basket.findOne({ userId });
        if (!basket) {
            return res.status(404).json({ message: 'Sepet bulunamadı.' });
        }

        basket.items = [];
        await basket.save();

        res.status(200).json({ message: 'Sepet tamamen temizlendi.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

const basketItemShow = async (req, res) => {
    try {
        const userId = req.user.id;

        const basket = await Basket.findOne({ userId });
        if (!basket) return res.status(200).json({ items: [] });

        const items = basket.items.map((p) => ({
            id: p.productId,
            name: typeof p.name === 'object' ? p.name.tr || p.name.en : p.name,
            price: p.price,
            quantity: p.quantity,
            image: p.image,
        }));

        res.status(200).json({ items });
    } catch (error) {
        console.error('Sepet gösterme hatası:', error);
        res.status(500).json({ message: 'Sepet yüklenemedi.' });
    }
};

module.exports = {
    basketItemShow,
    basketItemAdd,
    basketItemRemove,
    basketItemUpdate,
    basketClear
};