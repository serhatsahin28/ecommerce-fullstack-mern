// workers/orderWorker.js
const amqp = require('amqplib');
const path = require('path');

// 1. .env dosyasını en garanti yöntemle yüklüyoruz
const envPath = path.resolve(__dirname, '../src/.env'); 
require('dotenv').config({ path: envPath });

// DEBUG: Bakalım .env okunmuş mu?
console.log("-----------------------------------------");
console.log("📂 .env Dosya Yolu:", envPath);
console.log("📡 OKUNAN HOST:", process.env.MAIL_HOST);
console.log("📧 OKUNAN USER:", process.env.MAIL_USER);
console.log("-----------------------------------------");

// sendEmail fonksiyonunu içe aktar
const { sendEmail } = require('../src/utils/sendEmail');

const startWorker = async () => {
  try {
    // Eğer host hâlâ undefined ise burada durduralım ki boşuna uğraşma
    if (!process.env.MAIL_HOST || process.env.MAIL_HOST === "undefined") {
      console.error("❌ HATA: .env dosyası okunamadı veya MAIL_HOST tanımlı değil!");
      process.exit(1); 
    }

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'order_cancelled_notification';

    await channel.assertQueue(queue, { durable: true });
    console.log(`📡 Kuyruk dinleniyor: ${queue}...`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        console.log("📨 Mesaj Alındı. Alıcı:", data.email);

        try {
          await sendEmail({
            to: data.email,
            subject: "Sipariş İptal Onayı",
            html: `<h2>Siparişiniz İptal Edildi</h2><p>#${data.orderCode} nolu sipariş iadesi yapılmıştır.</p>`
          });
          
          console.log("✅ Mail başarıyla iletildi.");
          channel.ack(msg);
        } catch (mailError) {
          console.error("❌ Mail Gönderilemedi! Hata Detayı:", mailError.message);
          channel.nack(msg);
        }
      }
    });
  } catch (error) {
    console.error("RabbitMQ Worker Hatası:", error);
  }
};

startWorker();