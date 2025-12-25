const iyzipay = require("../config/iyzico");

const refundWithIyzico = (order) => {
  return new Promise((resolve) => {
    const request = {
      locale: "tr",
      conversationId: order.orderCode,
      paymentTransactionId: order.payment.iyzicoReference,
      price: order.totalAmount
    };

    iyzipay.refund.create(request, (err, result) => {
      if (err) {
        return resolve({
          success: false,
          error: err
        });
      }

      if (result.status !== "success") {
        return resolve({
          success: false,
          error: result.errorMessage
        });
      }

      resolve({
        success: true,
        iyzicoResult: result
      });
    });
  });
};

module.exports = refundWithIyzico;
