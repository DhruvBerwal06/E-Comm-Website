const orders = [
  {
    shippingAddress: {
      address: "123 Main Street",
      city: "New York",
      postalCode: "10001",
      country: "USA",
    },
    paymentMethod: "PayPal",
    paymentResult: {
      id: "PAYPAL_ID_12345",
      status: "COMPLETED",
      update_time: "2026-07-28T10:00:00.000Z",
      email_address: "john@example.com",
    },
    itemsPrice: 89.99,
    taxPrice: 15.0,
    shippingPrice: 10.0,
    totalPrice: 114.99,
    isPaid: true,
    paidAt: new Date(),
    isDelivered: false,
  },
];

export default orders;
