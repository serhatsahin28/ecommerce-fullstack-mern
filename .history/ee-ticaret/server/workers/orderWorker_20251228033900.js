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

// orderWorker.js - Güncellenmiş Halı
// ... (bağlantı ve env kısımları aynı)

const startWorker = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // İki farklı kuyruğu da aynı worker içinde dinleyebilirsin
    const queues = ['order_cancelled_notification', 'send_order_link_mail'];

    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: true });
      console.log(`📡 Kuyruk dinleniyor: ${queue}...`);

      channel.consume(queue, async (msg) => {
        if (msg !== null) {
          const data = JSON.parse(msg.content.toString());
          
          // Eğer data içinde hazır subject/html varsa onu kullan (Sipariş Linki gibi)
          // Yoksa iptal maili için varsayılan bir şablon oluştur
          const mailOptions = {
            to: data.to || data.email, // controller'larda hangisini kullandıysan
            subject: data.subject || "Sipariş Bilgilendirmesi",
            html: data.html || `<h2>Sipariş Durumu</h2><p>#${data.orderCode} nolu işleminiz tamamlanmıştır.</p>`
          };

          try {
            await sendEmail(mailOptions);
            console.log(`✅ Mail başarıyla gönderildi: ${mailOptions.to}`);
            channel.ack(msg);
          } catch (mailError) {
            console.error("❌ Mail Hatası:", mailError.message);
            channel.nack(msg, false, false);
          }
        }
      });
    }
  } catch (error) {
    console.error("RabbitMQ Worker Hatası:", error);
  }
};

startWorker();