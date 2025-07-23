const mongoose = require('mongoose');

// Çok dilli metinler için kullanılacak ortak şema
const MultiLangStringSchema = new mongoose.Schema({
  tr: { type: String, required: true },
  en: { type: String, required: true }
}, { _id: false });

const TranslationSchema = new mongoose.Schema({
  name: { type: MultiLangStringSchema, required: true },
  description: { type: MultiLangStringSchema, required: true },
  features: { type: [MultiLangStringSchema], default: [] },
  reviews: { type: [MultiLangStringSchema], default: [] }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  product_id: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  rating: { type: Number, required: true },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  translations: {
    tr: {
      name: { type: String, required: true },
      description: { type: String, required: true },
      features: [String],
      reviews: [String]
    },
    en: {
      name: { type: String, required: true },
      description: { type: String, required: true },
      features: [String],
      reviews: [String]
    }
  }
}, { _id: false });

const CategorySchema = new mongoose.Schema({
  category_key: { type: String, required: true },
  title: { type: MultiLangStringSchema, required: true },
  products: { type: [ProductSchema], default: [] }
}, { _id: false });

const HeroSlideSchema = new mongoose.Schema({
  //  slider_id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
  image: { type: String, required: false },
  title: { type: MultiLangStringSchema, required: true },
  subtitle: { type: MultiLangStringSchema, required: true },
  cta: { type: MultiLangStringSchema, required: false },
  cta_link: { type: MultiLangStringSchema, required: false }
});

const BannerSchema = new mongoose.Schema({
  title: { type: MultiLangStringSchema, required: true },
  desc: { type: MultiLangStringSchema, required: true },
  cta: { type: MultiLangStringSchema, required: true },
  cta_link: { type: MultiLangStringSchema, required: true }
}, { _id: false });

const AdvantageSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  text: { type: MultiLangStringSchema, required: true }
}, { _id: false });

const StatSchema = new mongoose.Schema({
  value: { type: String, required: true },
  desc: { type: MultiLangStringSchema, required: true }
}, { _id: false });

const HomeSchema = new mongoose.Schema({
  page_language: { type: [String], required: true },
  page_title: { type: MultiLangStringSchema, required: true },
  page_subtitle: { type: MultiLangStringSchema, required: true },
  view_all: { type: MultiLangStringSchema, required: true },
  featured_products: { type: MultiLangStringSchema, required: true },
  best_sellers: { type: MultiLangStringSchema, required: true },
  loading: { type: MultiLangStringSchema, required: true },
  heroSlides: { type: [HeroSlideSchema], required: true },
  banner: { type: BannerSchema, required: true },
  advantages: { type: [AdvantageSchema], required: true },
  stats: { type: [StatSchema], required: true },
  categories: { type: [CategorySchema], required: true }
}, {
  timestamps: true,
  collection: 'home'
});

module.exports = mongoose.model('Home', HomeSchema);
