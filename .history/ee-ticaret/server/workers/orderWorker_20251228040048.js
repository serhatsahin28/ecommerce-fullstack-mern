const amqp = require('amqplib');
const path = require('path');
const envPath = path.resolve(__dirname, '../src/.env'); 
require('dotenv').config({ path: envPath });

const { sendEmail } = require('../src/utils/sendEmail');

const startWorker = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // DİNLEMEK İSTEDİĞİN TÜM KUYRUKLAR BURADA
    const queues = [
      'order_cancelled_notification', 
      'send_order_link_mail', 
      'order_confirmation_notification' // Yeni eklediğimiz
    ];

    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: true });
      console.log(`📡 Kuyruk dinleniyor: ${queue}...`);

      channel.consume(queue, async (msg) => {
        if (msg !== null) {
          const data = JSON.parse(msg.content.toString());
          let mailOptions = {
            to: data.to || data.email,
            subject: data.subject || "Bilgilendirme",
            html: data.html || ""
          };

          // KUYRUĞA GÖRE ÖZEL İÇERİK OLUŞTURMA
          switch (queue) {
            case 'order_confirmation_notification':
              const itemsList = data.cart.map(item => `<li>${item.name} x ${item.quantity}</li>`).join('');
              mailOptions.subject = `Siparişiniz Alındı! - #${data.orderCode}`;
              mailOptions.html = `
                <h2>Merhaba ${data.firstName},</h2>
                <p>Siparişiniz başarıyla oluşturuldu.</p>
                <p><b>Sipariş Kodu:</b> #${data.orderCode}</p>
                <ul>${itemsList}</ul>
                <p><b>Toplam:</b> ${data.totalAmount} TL</p>
              `;
              break;

            case 'order_cancelled_notification':
              if (!mailOptions.html) { // Eğer controller'dan hazır html gelmediyse
                mailOptions.subject = "Sipariş İptal Onayı";
                mailOptions.html = `<h2>İade Onaylandı</h2><p>#${data.orderCode} nolu siparişinizin iadesi yapılmıştır.</p>`;
              }
              break;
              
            // 'send_order_link_mail' zaten data.html ile dolu geldiği için direkt geçer.
          }

          try {
            await sendEmail(mailOptions);
            console.log(`✅ [${queue}] Mail başarıyla gönderildi: ${mailOptions.to}`);
            channel.ack(msg);
          } catch (mailError) {
            console.error(`❌ [${queue}] Mail Hatası:`, mailError.message);
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