🛒 MERN Stack Full-Stack E-Commerce Application

A modern, responsive, and mobile-friendly e-commerce web application. Users can browse products, add them to the cart, and securely complete payments using iyzico integration. Full management is provided via the admin panel. Features include guest checkout, multi-language support (TR/EN), stock tracking, order cancellation, and email notifications.

🚀 Features
👤 User / Guest Side

Responsive & mobile-friendly design (Bootstrap + React)

Product listing, detail pages, search & filtering

Shopping cart system (local + backend sync)

Guest checkout and order tracking

JWT-based user registration, login & session management

User profile editing

Multi-language support: Turkish & English (i18next)

iyzico payment integration (Checkout Form)

Card information saving (iyzico tokenization)

Order cancellation (user & guest)

Real-time stock display and stock reduction

🛠️ Admin Panel

Add, delete, update products

View and manage orders

List users

Manage homepage content and featured products

📩 Other Features

Email notifications with Nodemailer:

When an order is created

When an order is canceled

Guest order tracking link email
Security:

Password hashing with bcrypt

JWT authentication

Secrets managed via .env
🧰 Technologies Used
🎨 Frontend (client folder)

React 19

Vite

React Router DOM

i18next, react-i18next, i18next-browser-languagedetector

Bootstrap 5, React-Bootstrap

React Icons, Lucide React, React Slick

React Toastify

jwt-decode
⚙️ Backend (server folder)

Node.js + Express

MongoDB + Mongoose

JWT (jsonwebtoken)

bcryptjs

iyzico (iyzipay)

Nodemailer

dotenv, uuid
Setup (Run Locally)
🔧 Requirements

Node.js 18+ (LTS recommended)

MongoDB (local installation or MongoDB Atlas)

iyzico test account
👉 https://dev.iyzico.com

1. Clone the Repository
git clone https://github.com/serhatsahin28/ecommerce-fullstack-mern.git
cd ecommerce-fullstack-mern/ee-ticaret
🖥️ 2. Backend Setup & Run
cd server
npm install


Create .env file in server folder:
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_very_strong_and_long_secret_key
IYZICO_API_KEY=your_iyzico_test_api_key
IYZICO_SECRET_KEY=your_iyzico_test_secret_key
IYZICO_URI=https://sandbox-api.iyzico.com
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_specific_password

📌 For Gmail, you must use an App Password.


Run Backend:
npm run dev
If the dev script does not exist, add this to package.json:

"scripts": {
  "dev": "nodemon index.js"
}
Backend API:
👉 http://localhost:5000
🌐 3. Frontend Setup & Run
cd ../client
npm install


Set API URL (client/.env.local):
VITE_API_URL=http://localhost:5000

Run Frontend:
npm run dev

App will open at:
👉 http://localhost:5173


▶️ Run Order Summary

Start MongoDB (mongod)

Run backend

Run frontend

💳 iyzico Test Cards

👉 https://dev.iyzico.com/tr/test-kartlari
