import AdminSidebar from './sidebar.js';
import OrderDetailsPage from './order-details-page.js';

const ORDER_STATES = ['New', 'Preparing', 'Ready', 'Completed'];

const TYPE_DETAILS = {
  'dine-in': { label: 'Dine-in', icon: 'restaurant' },
  delivery: { label: 'Delivery', icon: 'home' },
  'pick-up': { label: 'Pick-up', icon: 'inventory_2' },
};

const ITEM_IMAGES = [
  '../assets/images/No%20Menu%20Image.png',
];

function addOrderDetails(order) {
  const total = Number(order.amount.replace('$', ''));
  const fees = order.type === 'delivery'
    ? [{ label: 'Service Fees', amount: 1.50 }, { label: 'Packaging Fee', amount: 1.00 }, { label: 'Delivery Fee', amount: 3.00 }]
    : order.type === 'pick-up'
      ? [{ label: 'Service Fees', amount: 1.00 }, { label: 'Packaging Fee', amount: 1.00 }]
      : [{ label: 'Service Fees', amount: 2.50 }];
  const subtotal = total - fees.reduce((sum, fee) => sum + fee.amount, 0);
  const firstItemPrice = Number((subtotal * .72).toFixed(2));
  const secondItemPrice = Number((subtotal - firstItemPrice).toFixed(2));

  const fulfilment = order.type === 'delivery'
    ? {
      title: 'Delivery Details',
      rows: [
        { icon: 'storefront', title: 'Lanita Restaurant', subtitle: '123 Gourmet Way, Food City' },
        { icon: 'location_on', title: 'Engineering Hall B-12', subtitle: 'Main Entrance Reception' },
      ],
    }
    : order.type === 'pick-up'
      ? {
        title: 'Pick-up Details',
        rows: [
          { icon: 'storefront', title: 'Lanita Central Kitchen', subtitle: '123 Restaurant Street' },
          { icon: 'schedule', title: 'Estimated Pick-up Time', subtitle: '1:15 PM' },
        ],
      }
      : {
        title: 'Table Details',
        rows: [
          { icon: 'table_restaurant', title: 'Table B-12', subtitle: 'Main Dining Hall' },
        ],
      };

  return {
    ...order,
    customer: 'Aina Rahman',
    items: [
      { id: 1, name: 'Zesty Chicken Bowl', note: 'Extra dressing, no olives', quantity: 1, price: firstItemPrice, image: ITEM_IMAGES[0] },
      { id: 2, name: 'Peach Iced Tea', note: 'Large, 50% ice', quantity: 1, price: secondItemPrice, image: ITEM_IMAGES[1] },
    ],
    subtotal,
    fees,
    total,
    fulfilment,
  };
}

function initialOrders() {
  return [
    { id: '#1235', type: 'pick-up', state: 'New', date: 'Oct 24, 2023', time: '1:05 PM', amount: '$10.80' },
    { id: '#1234', type: 'dine-in', state: 'Preparing', date: 'Oct 24, 2023', time: '12:45 PM', amount: '$24.50' },
    { id: '#1233', type: 'delivery', state: 'Ready', date: 'Oct 24, 2023', time: '11:30 AM', amount: '$18.20' },
    { id: '#1230', type: 'delivery', state: 'Completed', date: 'Oct 24, 2023', time: '7:15 PM', amount: '$32.00' },
    { id: '#1225', type: 'dine-in', state: 'Completed', date: 'Oct 20, 2023', time: '1:20 PM', amount: '$15.50' },
    { id: '#1218', type: 'pick-up', state: 'Completed', date: 'Oct 18, 2023', time: '6:45 PM', amount: '$42.10' },
  ].map(addOrderDetails);
}

export default {
  name: 'OrdersPage',
  components: { AdminSidebar, OrderDetailsPage },
  emits: ['navigate', 'state-change'],

  data() {
    return {
      orders: initialOrders(),
      searchQuery: '',
      activeFilter: 'all',
      filters: ['all', 'New', 'Preparing', 'Ready'],
      activeView: 'orders',
      selectedOrder: null,
    };
  },

  computed: {
    activeOrders() {
      const keyword = this.searchQuery.trim().toLowerCase();
      return this.orders.filter((order) => {
        if (order.state === 'Completed') return false;
        const matchesState = this.activeFilter === 'all' || order.state === this.activeFilter;
        const type = TYPE_DETAILS[order.type].label;
        const matchesSearch = !keyword
          || `Order ${order.id} ${order.state} ${type} ${order.amount}`.toLowerCase().includes(keyword);
        return matchesState && matchesSearch;
      });
    },

    historyOrders() {
      return this.orders.filter((order) => order.state === 'Completed');
    },
  },

  methods: {
    typeDetails(type) {
      return TYPE_DETAILS[type];
    },

    changeState(order, direction) {
      const currentIndex = ORDER_STATES.indexOf(order.state);
      const nextIndex = Math.max(0, Math.min(ORDER_STATES.length - 1, currentIndex + direction));
      if (nextIndex === currentIndex) return;

      order.state = ORDER_STATES[nextIndex];
      this.$emit('state-change', { orderId: order.id, state: order.state });
    },

    cancelOrder(order) {
      order.state = 'Completed';
      order.cancelled = true;
      this.$emit('state-change', { orderId: order.id, state: order.state, cancelled: true });
    },

    openOrder(order) {
      this.selectedOrder = order;
      this.activeView = 'details';
    },

    closeOrderDetails() {
      this.activeView = 'orders';
      this.selectedOrder = null;
    },

    setOrderState({ orderId, state }) {
      const order = this.orders.find((entry) => entry.id === orderId);
      if (!order) return;
      order.state = state;
      this.$emit('state-change', { orderId, state });
    },

    cancelSelectedOrder(order) {
      this.cancelOrder(order);
      this.closeOrderDetails();
    },
  },

  template: `
    <order-details-page
      v-if="activeView === 'details' && selectedOrder"
      :order="selectedOrder"
      @back="closeOrderDetails"
      @state-change="setOrderState"
      @cancel="cancelSelectedOrder"
      @navigate="$emit('navigate', $event)"
    ></order-details-page>

    <main v-else class="orders-page admin-shell" aria-label="Live orders">
      <admin-sidebar active="orders" @navigate="$emit('navigate', $event)"></admin-sidebar>

      <div class="admin-main orders-main">
        <app-header title="Live Orders" show-logout></app-header>

        <div class="orders-container">
          <section class="orders-heading">
            <h1>Live Orders</h1>
            <p>Track dine-in, delivery, and pick-up orders as they move through service.</p>
          </section>

          <label class="orders-search">
            <span class="material-symbols-outlined">search</span>
            <input v-model="searchQuery" type="search" placeholder="Search orders..." autocomplete="off" />
          </label>

          <div class="orders-filters" aria-label="Order state filters">
            <button
              v-for="filter in filters"
              :key="filter"
              class="orders-filter"
              :class="{ active: activeFilter === filter }"
              type="button"
              @click="activeFilter = filter"
            >{{ filter === 'all' ? 'All' : filter }}</button>
          </div>

          <div class="orders-section-head">
            <h2>Active Orders</h2>
            <span>{{ activeOrders.length }} active</span>
          </div>

          <div v-if="activeOrders.length" class="orders-list active-orders-list">
            <article v-for="order in activeOrders" :key="order.id" class="order-card active-order-card">
              <div class="order-card-main">
                <div class="order-type-icon"><span class="material-symbols-outlined">{{ typeDetails(order.type).icon }}</span></div>
                <div class="order-copy">
                  <h3>Order {{ order.id }}</h3>
                  <div class="order-status">{{ order.state }} <span>&middot; {{ typeDetails(order.type).label }}</span></div>
                  <time>{{ order.date }}<br>{{ order.time }}</time>
                </div>
                <strong class="order-amount">{{ order.amount }}</strong>
                <button class="order-open" type="button" :aria-label="'Open order ' + order.id" @click="openOrder(order)"><span class="material-symbols-outlined">chevron_right</span></button>
              </div>

              <div class="order-actions">
                <button class="order-cancel" type="button" @click="cancelOrder(order)">Cancel</button>
                <div class="state-control" :aria-label="'Change state for order ' + order.id">
                  <button type="button" aria-label="Previous state" :disabled="order.state === 'New'" @click="changeState(order, -1)">
                    <span class="material-symbols-outlined">chevron_left</span>
                  </button>
                  <span>{{ order.state }}</span>
                  <button type="button" aria-label="Next state" @click="changeState(order, 1)">
                    <span class="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </article>
          </div>
          <div v-else class="orders-empty">No active orders found</div>

          <div class="orders-section-head history-section-head">
            <h2>Order History</h2>
            <span class="history-period">Today <span class="material-symbols-outlined">keyboard_arrow_down</span></span>
          </div>

          <div class="orders-list history-orders-list">
            <article v-for="order in historyOrders" :key="order.id" class="order-card history-order-card">
              <div class="order-card-main">
                <div class="order-type-icon muted"><span class="material-symbols-outlined">{{ typeDetails(order.type).icon }}</span></div>
                <div class="order-copy">
                  <h3>Order {{ order.id }}</h3>
                  <div class="order-status muted">{{ order.cancelled ? 'Cancelled' : 'Completed' }} <span>&middot; {{ typeDetails(order.type).label }}</span></div>
                  <time>{{ order.date }}<br>{{ order.time }}</time>
                </div>
                <strong class="order-amount">{{ order.amount }}</strong>
                <button class="order-open" type="button" :aria-label="'Open order ' + order.id" @click="openOrder(order)"><span class="material-symbols-outlined">chevron_right</span></button>
              </div>
            </article>
          </div>
        </div>
      </div>

      <bottom-navigation active="orders" @navigate="$emit('navigate', $event)"></bottom-navigation>
    </main>
  `,
};
