const amqp = require('amqplib');

const publishToQueue = async (queueName, data) => {
  try {
    // 1. RabbitMQ'ya bağlan (Bilgisayarındaki yerel servis)
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    // 2. Kuyruğu oluştur (Eğer yoksa)
    await channel.assertQueue(queueName, { durable: true });

    // 3. Veriyi gönder
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
      persistent: true
    });

    console.log(`✉️ Mesaj ${queueName} kuyruğuna gönderildi.`);

    // 4. Bağlantıyı kapat
    setTimeout(() => {
      connection.close();
    }, 500);

  } catch (error) {
    console.error("❌ RabbitMQ Yayınlama Hatası:", error);
    // Hata olsa bile ana işlem durmasın diye burada throw etmiyoruz
  }
};

module.exports = { publishToQueue };