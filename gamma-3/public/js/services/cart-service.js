import { apiRequest } from './api-client.js';

// Fetch the current user's cart (items + total_quantity badge count).
export const getCart = () => apiRequest('/cart');

export const addToCart = (menuItemId, quantity, specialInstructions, addons) => apiRequest('/cart/items', {
  method: 'POST',
  body: JSON.stringify({ menuItemId, quantity, specialInstructions, addons }),
});

export const updateCartItemQuantity = (cartItemId, quantity) => apiRequest(`/cart/items/${cartItemId}`, {
  method: 'PATCH',
  body: JSON.stringify({ quantity }),
});

export const deleteCartItem = (cartItemId) => apiRequest(`/cart/items/${cartItemId}`, {
  method: 'DELETE',
});

export const checkoutCart = (orderType, paymentMethod, tableNumber, deliveryAddress, customerNote, pickupAt) => apiRequest('/cart/checkout', {
  method: 'POST',
  body: JSON.stringify({ order_type: orderType, payment_method: paymentMethod, table_number: tableNumber, delivery_address: deliveryAddress, customer_note: customerNote, pickup_at: pickupAt }),
});
