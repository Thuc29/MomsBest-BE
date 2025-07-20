const validateOrderData = (orderData) => {
  const errors = [];

  // Validate required fields
  if (
    !orderData.orderItems ||
    !Array.isArray(orderData.orderItems) ||
    orderData.orderItems.length === 0
  ) {
    errors.push("Order items are required");
  }

  if (!orderData.total_amount || orderData.total_amount <= 0) {
    errors.push("Total amount is required and must be greater than 0");
  }

  if (!orderData.shipping_address || !orderData.shipping_address.trim()) {
    errors.push("Shipping address is required");
  }

  if (!orderData.shipping_phone || !orderData.shipping_phone.trim()) {
    errors.push("Shipping phone is required");
  }

  if (!orderData.shipping_name || !orderData.shipping_name.trim()) {
    errors.push("Shipping name is required");
  }

  // Validate payment method
  const validPaymentMethods = [
    "cod",
    "bank_transfer",
    "Bank Transfer",
    "Cash on Delivery",
  ];
  if (
    orderData.payment_method &&
    !validPaymentMethods.includes(orderData.payment_method)
  ) {
    errors.push("Invalid payment method");
  }

  // Validate order items
  if (orderData.orderItems && Array.isArray(orderData.orderItems)) {
    orderData.orderItems.forEach((item, index) => {
      if (!item.product_id) {
        errors.push(`Product ID is required for item ${index + 1}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Valid quantity is required for item ${index + 1}`);
      }
      if (!item.unit_price || item.unit_price <= 0) {
        errors.push(`Valid unit price is required for item ${index + 1}`);
      }
      if (!item.total_price || item.total_price <= 0) {
        errors.push(`Valid total price is required for item ${index + 1}`);
      }
      // Validate that total_price = quantity * unit_price
      if (item.quantity && item.unit_price && item.total_price) {
        const expectedTotal = item.quantity * item.unit_price;
        if (Math.abs(item.total_price - expectedTotal) > 0.01) {
          errors.push(
            `Total price for item ${
              index + 1
            } should be ${expectedTotal} (quantity × unit price)`
          );
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const sanitizeOrderData = (orderData) => {
  return {
    ...orderData,
    shipping_address: orderData.shipping_address
      ? orderData.shipping_address.trim()
      : "",
    shipping_phone: orderData.shipping_phone
      ? orderData.shipping_phone.trim()
      : "",
    shipping_name: orderData.shipping_name
      ? orderData.shipping_name.trim()
      : "",
    notes: orderData.notes ? orderData.notes.trim() : undefined,
    payment_method: orderData.payment_method || "cod",
    shipping_fee: orderData.shipping_fee || 0,
    discount_amount: orderData.discount_amount || 0,
    // Ensure order items have all required fields
    orderItems: orderData.orderItems
      ? orderData.orderItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price || item.quantity * item.unit_price,
        }))
      : [],
  };
};

module.exports = {
  validateOrderData,
  sanitizeOrderData,
};
