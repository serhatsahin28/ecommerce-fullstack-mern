



const mongoose = require('mongoose');

const localizedStringSchema = new mongoose.Schema({
    tr: { type: String, default: '' },
    en: { type: String, default: '' }
}, { _id: false });

// --- VARYANT ŞEMASI ---
const variantSchema = new mongoose.Schema({
    // variant_id: { type: String, required: true },
    variant_id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    sku: { type: String, sparse: true },
    color_name: { type: String }, 
    color_code: { type: String }, 
    size: { type: String },       
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    // ÖNEMLİ: Resimleri burada tutmak yerine renk bazlı gruplayacağız 
    // veya burada tutup kod tarafında aynı URL'leri basacağız.
    // Senin "aynı renk farklı beden" mantığın için images'ı opsiyonel yapıyoruz.
    images: [{ type: String }] 
});

const productSchema = new mongoose.Schema({
    category_key: { type: String, required: true, index: true },
    
    // Varyant tipini bilmek front-end ve iş mantığı için çok hayatidir
    // 'none' (Varyantsız), 'size' (Sadece Beden), 'color' (Renk ve Beden)
    variantType: { type: String, enum: ['none', 'size', 'color'], default: 'none' },

    // Varyantsız veya sadece beden varyantlı ürünler için:
    price: { type: Number, default: 0 }, 
    stock: { type: Number, default: 0 }, // Varyantsızsa burası, varyantlıysa varyantların toplamı
    sku: { type: String }, // Varyantsız ürünün barkodu
    image: { type: String }, // Ana kapak resmi (Varyantsız veya Sadece Beden ise)
    extraImages: [{ type: String }], // Galeri resimleri (Varyantsız veya Sadece Beden ise)
    
    hasVariants: { type: Boolean, default: false },
    variants: [variantSchema],

    translations: {
        tr: {
            name: { type: String, required: true },
            description: { type: String },
            features: [String]
        },
        en: {
            name: { type: String },
            description: { type: String },
            features: [String]
        }
    },

    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }

}, {
    timestamps: true,
    collection: 'products'
});

module.exports = mongoose.model('Product', productSchema);