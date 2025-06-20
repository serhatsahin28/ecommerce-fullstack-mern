const mongoose = require('mongoose');
const { Schema } = mongoose;

// Alt döküman şemaları

const TranslationSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  features: [String],
  reviews: [String]
}, { _id: false });

const TranslationsSchema = new Schema({
  tr: { type: TranslationSchema, required: true },
  en: { type: TranslationSchema, required: true }
}, { _id: false });

const ProductSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: false }, // senin verdiğin id kullanılır
  category_key: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  image: { type: String, required: true },
  images: [String],
  translations: { type: TranslationsSchema, required: true }
}, { _id: false });

const CategorySchema = new Schema({
  category_key: { type: String, required: true },
  title: { type: String, required: true },
  products: { type: [ProductSchema], default: [] }
}, { _id: false });

const HeroSlideSchema = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  cta: { type: String, required: true },
  cta_link: { type: String, required: true }
}, { _id: false });

const BannerSchema = new Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  cta: { type: String, required: true },
  cta_link: { type: String, required: true }
}, { _id: false });

const AdvantageSchema = new Schema({
  icon: { type: String, required: true },
  text: { type: String, required: true }
}, { _id: false });

const StatSchema = new Schema({
  value: { type: String, required: true },
  desc: { type: String, required: true }
}, { _id: false });

// Ana schema

const HomePageSchema = new Schema({
  page_language: { type: String, required: true, enum: ['tr', 'en'] },  // Dili belirtmek için
  page_title: { type: String, required: true },
  page_subtitle: { type: String, required: true },
  view_all: { type: String, required: true },
  featured_products: { type: String, required: true },
  best_sellers: { type: String, required: true },
  loading: { type: String, required: true },
  heroSlides: { type: [HeroSlideSchema], default: [] },
  banner: { type: BannerSchema, required: true },
  advantages: { type: [AdvantageSchema], default: [] },
  stats: { type: [StatSchema], default: [] },
  categories: { type: [CategorySchema], default: [] }
});

module.exports = mongoose.model('HomePage', HomePageSchema);
