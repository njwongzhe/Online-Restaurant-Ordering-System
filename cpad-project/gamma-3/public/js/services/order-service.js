import { apiRequest } from './api-client.js';

const STATUS_TO_UI = { new: 'New', preparing: 'Preparing', ready: 'Ready', out_for_delivery: 'Ready', completed: 'Completed', cancelled: 'Cancelled' };
const UI_TO_STATUS = { New: 'new', Preparing: 'preparing', Ready: 'ready', Completed: 'completed' };
const TYPE_TO_UI = { dine_in: 'dine-in', takeaway: 'pick-up', delivery: 'delivery' };

function imageUrl(path) {
  return `../${(path || 'assets/images/No Menu Image.png').split('/').map(encodeURIComponent).join('/')}`;
}

function mapOrder(order, restaurantAddress = '') {
  const created = new Date(order.created_at.replace(' ', 'T'));
  const fees = [
    { label: 'Service Fees', amount: Number(order.service_fee) },
    { label: 'Packaging Fee', amount: Number(order.packaging_fee) },
    { label: 'Delivery Fee', amount: Number(order.delivery_fee) },
  ].filter((fee) => fee.amount > 0);
  const type = TYPE_TO_UI[order.order_type];
  const originStr = restaurantAddress ? `Main kitchen (${restaurantAddress})` : 'Main kitchen';
  const pickupStr = restaurantAddress ? `Collection counter (${restaurantAddress})` : 'Collection counter';
  const fulfilment = type === 'delivery'
    ? { title: 'Delivery Details', rows: [{ icon: 'storefront', title: 'Lanita Restaurant', subtitle: originStr }, { icon: 'location_on', title: order.delivery_address || 'Delivery address', subtitle: order.customer_note || '' }] }
    : type === 'pick-up'
      ? { title: 'Pick-up Details', rows: [{ icon: 'storefront', title: 'Lanita Restaurant', subtitle: pickupStr }, { icon: 'schedule', title: 'Estimated Pick-up Time', subtitle: order.pickup_at || 'As soon as possible' }] }
      : { title: 'Table Details', rows: [{ icon: 'table_restaurant', title: `Table ${order.table_number || '-'}`, subtitle: 'Main Dining Hall' }] };
  let addonsTotal = 0;
  const items = (order.items || []).map((item) => {
    const itemAddons = (item.addons || []).map((addon) => {
      const addonPrice = Number(addon.unit_price);
      const addonQty = Number(addon.quantity);
      addonsTotal += addonPrice * addonQty;
      return {
        id: Number(addon.order_item_addon_id),
        name: addon.addon_name,
        price: addonPrice,
        quantity: addonQty,
      };
    });

    const itemBasePrice = Number(item.line_total);
    const itemAddonsPrice = itemAddons.reduce((sum, a) => sum + (a.price * a.quantity), 0);

    return {
      id: Number(item.order_item_id),
      name: item.item_name,
      note: item.special_instructions || '',
      quantity: Number(item.quantity),
      price: itemBasePrice + itemAddonsPrice,
      image: imageUrl(item.image_path),
      addons: itemAddons,
    };
  });

  const baseSubtotal = Number(order.subtotal);
  const displaySubtotal = baseSubtotal + addonsTotal;

  return {
    databaseId: Number(order.order_id), id: `#${order.order_number}`, type,
    state: STATUS_TO_UI[order.order_status], cancelled: order.order_status === 'cancelled',
    cancellationReason: order.cancellation_reason || '',
    createdDate: order.created_at.slice(0, 10),
    date: created.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: created.toLocaleTimeString('en-MY', { hour: 'numeric', minute: '2-digit' }),
    amount: `$${Number(order.total_amount).toFixed(2)}`, customer: order.display_name,
    items,
    subtotal: displaySubtotal, fees, total: Number(order.total_amount), fulfilment,
  };
}

export async function loadOrders() {
  let restaurantAddress = '';
  try {
    const settingsRes = await apiRequest('/settings');
    console.log('Fetched public settings response:', settingsRes);
    if (settingsRes && settingsRes.settings && settingsRes.settings.restaurant_address) {
      restaurantAddress = settingsRes.settings.restaurant_address;
    }
  } catch (err) {
    console.error('Failed to load public settings:', err);
  }

  const { orders } = await apiRequest('/orders');
  console.log('Mapped orders with restaurantAddress:', restaurantAddress);
  return orders.map(order => mapOrder(order, restaurantAddress));
}
export const updateOrderState = (id, state) => apiRequest(`/orders/${id}/state`, { method: 'PATCH', body: JSON.stringify({ status: UI_TO_STATUS[state] }) });
export const cancelOrder = (id, reason = '') => apiRequest(`/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) });
