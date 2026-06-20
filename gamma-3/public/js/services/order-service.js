import { apiRequest } from './api-client.js';

const STATUS_TO_UI = { pending: 'New', confirmed: 'New', preparing: 'Preparing', ready: 'Ready', out_for_delivery: 'Ready', completed: 'Completed', cancelled: 'Completed' };
const UI_TO_STATUS = { New: 'confirmed', Preparing: 'preparing', Ready: 'ready', Completed: 'completed' };
const TYPE_TO_UI = { dine_in: 'dine-in', takeaway: 'pick-up', delivery: 'delivery' };

function imageUrl(path) {
  return `../${(path || 'assets/images/No Menu Image.png').split('/').map(encodeURIComponent).join('/')}`;
}

function mapOrder(order) {
  const created = new Date(order.created_at.replace(' ', 'T'));
  const fees = [
    { label: 'Service Fees', amount: Number(order.service_fee) },
    { label: 'Packaging Fee', amount: Number(order.packaging_fee) },
    { label: 'Delivery Fee', amount: Number(order.delivery_fee) },
  ].filter((fee) => fee.amount > 0);
  const type = TYPE_TO_UI[order.order_type];
  const fulfilment = type === 'delivery'
    ? { title: 'Delivery Details', rows: [{ icon: 'storefront', title: 'Lanita Restaurant', subtitle: 'Main kitchen' }, { icon: 'location_on', title: order.delivery_address || 'Delivery address', subtitle: order.customer_note || '' }] }
    : type === 'pick-up'
      ? { title: 'Pick-up Details', rows: [{ icon: 'storefront', title: 'Lanita Restaurant', subtitle: 'Collection counter' }, { icon: 'schedule', title: 'Estimated Pick-up Time', subtitle: order.pickup_at || 'As soon as possible' }] }
      : { title: 'Table Details', rows: [{ icon: 'table_restaurant', title: `Table ${order.table_number || '-'}`, subtitle: 'Main Dining Hall' }] };
  return {
    databaseId: Number(order.order_id), id: `#${order.order_number}`, type,
    state: STATUS_TO_UI[order.order_status], cancelled: order.order_status === 'cancelled',
    date: created.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: created.toLocaleTimeString('en-MY', { hour: 'numeric', minute: '2-digit' }),
    amount: `$${Number(order.total_amount).toFixed(2)}`, customer: order.display_name,
    items: (order.items || []).map((item) => ({ id: Number(item.order_item_id), name: item.item_name, note: item.special_instructions || '', quantity: Number(item.quantity), price: Number(item.line_total), image: imageUrl(item.image_path) })),
    subtotal: Number(order.subtotal), fees, total: Number(order.total_amount), fulfilment,
  };
}

export async function loadOrders() {
  const { orders } = await apiRequest('/orders');
  return orders.map(mapOrder);
}
export const updateOrderState = (id, state) => apiRequest(`/orders/${id}/state`, { method: 'PATCH', body: JSON.stringify({ status: UI_TO_STATUS[state] }) });
export const cancelOrder = (id) => apiRequest(`/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({}) });
