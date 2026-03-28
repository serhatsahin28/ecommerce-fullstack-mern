const amqp = require("amqplib");

let connection;
let channel;

const connectRabbitMQ = async () => {
  if (channel) return channel;

  connection = await amqp.connect("amqp://localhost");
  channel = await connection.createChannel();

  console.log("🐰 RabbitMQ connected");
  return channel;
};

const publishToQueue = async (queueName, data) => {
  try {
    const ch = await connectRabbitMQ();

    await ch.assertQueue(queueName, { durable: true });

    ch.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );

    console.log(`📤 ${queueName} kuyruğuna mesaj atıldı`);
    return res.status(200).json({
      success: true,
      message: 'Sipariş sorgulama linki e-posta adresinize gönderildi.'
    });
  } catch (err) {
    console.error("❌ RabbitMQ publish error:", err);
  }
};

module.exports = { publishToQueue };
