const amqp = require('amqplib');
const {sendMail} = require('../src/utils/sendEmail'); // Az önce yazdığın dosya

const startWorker = async () => {
  try {
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
          // SMTP ile maili gönder
          await sendMail(
            data.email,
            "Siparişiniz İptal Edildi",
            `Merhaba, #${data.orderCode} numaralı siparişiniz başarıyla iptal edilmiştir ve ücret iadeniz yapılmıştır.`
          );
          
          console.log("✅ Mail başarıyla iletildi.");
          channel.ack(msg); // Mesajı kuyruktan sil
        } catch (mailError) {
          console.error("❌ Mail gönderme hatası:", mailError);
          // Hata olursa mesajı kuyrukta bırak (tekrar denesin)
          channel.nack(msg); 
        }
      }
    });
  } catch (error) {
    console.error("RabbitMQ Worker Hatası:", error);
  }
};

startWorker();