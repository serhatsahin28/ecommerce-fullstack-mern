const mongoose = require('mongoose');

const CategoryItemSchema = new mongoose.Schema({
  id: Number,
  title: String,
  subtitle: String,
  icon: String
}, { _id: false });

const CategoriesSchema = new mongoose.Schema({
  title: String,
  items: [CategoryItemSchema]
}, { _id: false });

const FooterCategoriesSchema = new mongoose.Schema({
  title: String,
  electronics: String,
  fashion: String,
  home: String
}, { _id: false });

const FooterSchema = new mongoose.Schema({
  aboutTitle: String,
  aboutText: String,
  categories: FooterCategoriesSchema,
  contactTitle: String,
  contactText: String,
  rights: String
}, { _id: false });

const ProductsSchema = new mongoose.Schema({
  title: String
}, { _id: false });

const CommonEnSchema = new mongoose.Schema({
  categories: CategoriesSchema,
  products: ProductsSchema,
  footer: FooterSchema
}, {
  versionKey: false,
  collection: 'commonEn'
});

const CommonEn = mongoose.model('CommonEn', CommonEnSchema, 'commonEn');
module.exports = CommonEn;
