# 🛒 MERN Stack Full-Stack E-Commerce Application

A modern, responsive, and mobile-friendly **e-commerce web application** built with the MERN stack. Users can browse products, add items to their cart, and complete secure payments using **iyzico**. The admin panel provides full control over products, orders, and users. Features include guest checkout, multi-language support (TR/EN), stock tracking, order cancellation, and email notifications.

**Project Status:** Completed and running in test environment  
**Deployment:** Coming soon (Vercel / Render)

---

## 🚀 Features

### 👤 User / Guest
- Responsive and mobile-friendly UI (Bootstrap + React)
- Product listing, detail pages, search, and filtering
- Shopping cart system (local + backend sync)
- Guest checkout and order tracking
- JWT-based authentication (register, login, session)
- User profile management
- Multi-language support: Turkish & English (i18next)
- iyzico payment integration (Checkout Form)
- Card storage via iyzico tokenization
- Order cancellation (user & guest)
- Real-time stock display and automatic stock reduction

### 🛠️ Admin Panel
- Add, update, and delete products
- View and manage orders
- List users
- Manage homepage content and featured products

### 📩 Notifications & Security
- Email notifications via Nodemailer:
  - Order created
  - Order canceled
  - Guest order tracking link
- Security:
  - Password hashing with bcrypt
  - JWT authentication
  - Secrets managed with environment variables

---

## 🧰 Tech Stack

### Frontend (client)
- React 19, Vite
- React Router DOM
- i18next, react-i18next, i18next-browser-languagedetector
- Bootstrap 5, React-Bootstrap
- React Icons, Lucide React, React Slick
- React Toastify
- jwt-decode

### Backend (server)
- Node.js, Express
- MongoDB, Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- iyzico (iyzipay)
- Nodemailer
- dotenv, uuid

---

## 🧑‍💻 Local Setup

### 🔧 Requirements
- Node.js 18+ (LTS recommended)
- MongoDB (local or MongoDB Atlas)
- iyzico test account → https://dev.iyzico.com

---

### 📦 Clone the Repository
```bash
git clone https://github.com/serhatsahin28/ecommerce-fullstack-mern.git
cd ecommerce-fullstack-mern/ee-ticaret
```

---

### 🖥️ Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_strong_secret_key
IYZICO_API_KEY=your_iyzico_test_api_key
IYZICO_SECRET_KEY=your_iyzico_test_secret_key
IYZICO_URI=https://sandbox-api.iyzico.com
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

Run backend:
```bash
npm run dev
```

Backend API:  
👉 http://localhost:5000

---

### 🌐 Frontend Setup
```bash
cd ../client
npm install
```

Create `client/.env.local`:
```env
VITE_API_URL=http://localhost:5000
```

Run frontend:
```bash
npm run dev
```

App runs at:  
👉 http://localhost:5173

---

## ▶️ Run Order
1. Start MongoDB (`mongod`)
2. Run backend
3. Run frontend

---

## 💳 iyzico Test Cards
https://dev.iyzico.com/tr/test-kartlari

---

## 📌 Notes
- Built with a scalable, modular, and production-ready architecture.
- All sensitive data is managed securely via environment variables.
- Recommended deployment:

