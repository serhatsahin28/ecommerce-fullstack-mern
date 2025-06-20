import mongoose from 'mongoose';

/* | Alt şemalar | — _id: false → alt belgeler için ekstra _id üretilmez */
const CategoryItemSchema = new mongoose.Schema({
  id:       Number,
  title:    String,
  subtitle: String,
  icon:     String
}, { _id: false });

const CategoriesSchema = new mongoose.Schema({
  title: String,
  items: [CategoryItemSchema]
}, { _id: false });

const FooterCategoriesSchema = new mongoose.Schema({
  title:       String,
  electronics: String,
  fashion:     String,
  home:        String
}, { _id: false });

const FooterSchema = new mongoose.Schema({
  aboutTitle:  String,
  aboutText:   String,
  categories:  FooterCategoriesSchema,
  contactTitle:String,
  contactText: String,
  rights:      String
}, { _id: false });

const EcommerceEnSchema = new mongoose.Schema({
  categories: CategoriesSchema,
  products:   { title: String },           // ürün listesi sonra eklenecekse Mixed de bırakabilirsiniz
  footer:     FooterSchema
}, { versionKey: false });

export default mongoose.model('EcommerceEn', EcommerceEnSchema, 'ecommerceEn');
