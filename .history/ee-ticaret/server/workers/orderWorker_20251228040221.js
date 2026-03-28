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
              // Ürünleri resimleriyle birlikte listeleyelim
              const itemsList = data.cart.map(item => `
    <div style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
      <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 15px; border-radius: 4px;">
      <div>
        <p style="margin: 0; font-weight: bold;">${item.name}</p>
        <p style="margin: 0; color: #666; font-size: 14px;">Adet: ${item.quantity} - Fiyat: ${item.price} TL</p>
      </div>
    </div>
  `).join('');

              mailOptions.subject = `Siparişiniz Alındı! - #${data.orderCode}`;
              mailOptions.html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #333;">Merhaba ${data.firstName},</h2>
      <p>Siparişiniz başarıyla oluşturuldu. İşte detaylar:</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
        <p><b>Sipariş Kodu:</b> #${data.orderCode}</p>
        ${itemsList}
        <p style="font-size: 18px; font-weight: bold; text-align: right;">Toplam: ${data.totalAmount} TL</p>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">Bizi tercih ettiğiniz için teşekkürler!</p>
    </div>
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