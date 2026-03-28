const amqp = require('amqplib');
const path = require('path');
// ✅ .env dosyasını bir üst klasörde ara ve yükle
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ✅ sendEmail fonksiyonunu süslü parantez ile al (çünkü module.exports = {sendEmail} demiştin)
const { sendEmail } = require('../src/utils/sendEmail'); 

const startWorker = async () => {
  try {
    // .env kontrolü için log (Hata varsa burada belli olur)
    console.log("📡 SMTP Sunucusu:", process.env.MAIL_HOST); 

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'order_cancelled_notification';

    await channel.assertQueue(queue, { durable: true });
    console.log(`📡 Kuyruk dinleniyor: ${queue}...`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        console.log("📨 Mail gönderilecek veri alındı:", data.email);

        try {
          // ✅ BURASI KRİTİK: Fonksiyonuna uygun şekilde TEK BİR OBJE gönderiyoruz
          await sendEmail({
            to: data.email,
            subject: "Siparişiniz İptal Edildi",
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #d9534f;">Sipariş İptal Onayı</h2>
                <p>Merhaba,</p>
                <p><strong>#${data.orderCode}</strong> numaralı siparişiniz başarıyla iptal edilmiştir.</p>
                <p>Ödeme iadeniz bankanıza iletilmiştir.</p>
              </div>
            `
          });
          
          console.log("✅ Mail başarıyla iletildi.");
          channel.ack(msg); 
        } catch (mailError) {
          console.error("❌ Mail gönderme hatası:", mailError);
          // Hata olursa mesajı kuyruğa geri bırak (tekrar denesin)
          channel.nack(msg); 
        }
      }
    });
  } catch (error) {
    console.error("RabbitMQ Worker Hatası:", error);
  }
};

startWorker();