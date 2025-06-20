const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  features: [String],
  reviews: [String]
}, { _id: false });

const TranslationsSchema = new mongoose.Schema({
  tr: { type: TranslationSchema, required: true },
  en: { type: TranslationSchema, required: true }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: false }, // Verilen id kullanılacak
  category_key: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  image: { type: String, required: true },
  images: [String],
  translations: { type: TranslationsSchema, required: true }
}, { _id: false });

const CategorySchema = new mongoose.Schema({
  category_key: { type: String, required: true },
  title: { type: String, required: true },
  products: [ProductSchema]
}, { _id: false });

const HeroSlideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  cta: { type: String, required: true },
  cta_link: { type: String, required: true }
}, { _id: false });

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  cta: { type: String, required: true },
  cta_link: { type: String, required: true }
}, { _id: false });

const AdvantageSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  text: { type: String, required: true }
}, { _id: false });

const StatSchema = new mongoose.Schema({
  value: { type: String, required: true },
  desc: { type: String, required: true }
}, { _id: false });

const HomeSchema = new mongoose.Schema({
  page_language: { type: String, required: true },
  page_title: { type: String, required: true },
  page_subtitle: { type: String, required: true },
  view_all: { type: String, required: true },
  featured_products: { type: String, required: true },
  best_sellers: { type: String, required: true },
  loading: { type: String, required: true },
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
