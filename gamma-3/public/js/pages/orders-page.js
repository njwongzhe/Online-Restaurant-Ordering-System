import OrderDetailsPage from './order-details-page.js';
import { loadOrders, updateOrderState, cancelOrder as cancelOrderRequest } from '../services/order-service.js';

const ORDER_STATES = ['New', 'Preparing', 'Ready', 'Completed'];

const TYPE_LABELS = {
  'dine-in': 'Dine-in',
  delivery: 'Delivery',
  'pick-up': 'Pick-up',
};

function matchesOrderSearch(order, keyword) {
  if (!keyword) return true;
  const type = TYPE_LABELS[order.type] || order.type;
  return `Order ${order.id} ${order.state} ${type} ${order.amount} ${order.customer || ''}`
    .toLowerCase()
    .includes(keyword);
}

export default {
  name: 'OrdersPage',
  components: { OrderDetailsPage },
  emits: ['navigate', 'state-change', 'logout'],

  data() {
    return {
      orders: [],
      searchQuery: '',
      activeFilter: 'all',
      filters: ['all', 'New', 'Preparing', 'Ready'],
      activeView: 'orders',
      selectedOrder: null,
      loading: true,
      errorMessage: '',
    };
  },

  async mounted() {
    await this.refreshOrders();
  },

  computed: {
    activeOrders() {
      const keyword = this.searchQuery.trim().toLowerCase();
      return this.orders.filter((order) => {
        if (order.state === 'Completed') return false;
        const matchesState = this.activeFilter === 'all' || order.state === this.activeFilter;
        return matchesState && matchesOrderSearch(order, keyword);
      });
    },

    historyOrders() {
      const keyword = this.searchQuery.trim().toLowerCase();
      return this.orders.filter((order) => order.state === 'Completed' && matchesOrderSearch(order, keyword));
    },
  },

  methods: {
    async refreshOrders() {
      this.loading = true;
      try { this.orders = await loadOrders(); this.errorMessage = ''; }
      catch (error) { this.errorMessage = error.message; }
      finally { this.loading = false; }
    },

    async changeState(order, direction) {
      const currentIndex = ORDER_STATES.indexOf(order.state);
      const nextIndex = Math.max(0, Math.min(ORDER_STATES.length - 1, currentIndex + direction));
      if (nextIndex === currentIndex) return;

      const previous = order.state;
      order.state = ORDER_STATES[nextIndex];
      try { await updateOrderState(order.databaseId, order.state); }
      catch (error) { order.state = previous; this.errorMessage = error.message; }
    },

    async cancelOrder(order) {
      if (!window.confirm(`Cancel order ${order.id}?`)) return;
      try { await cancelOrderRequest(order.databaseId); order.state = 'Completed'; order.cancelled = true; }
      catch (error) { this.errorMessage = error.message; }
    },

    openOrder(order) {
      this.selectedOrder = order;
      this.activeView = 'details';
    },

    closeOrderDetails() {
      this.activeView = 'orders';
      this.selectedOrder = null;
    },

    async setOrderState({ orderId, state }) {
      const order = this.orders.find((entry) => entry.id === orderId);
      if (!order) return;
      const previous = order.state;
      order.state = state;
      try { await updateOrderState(order.databaseId, state); }
      catch (error) { order.state = previous; this.errorMessage = error.message; }
    },

    async cancelSelectedOrder(order) {
      await this.cancelOrder(order);
      if (order.cancelled) this.closeOrderDetails();
    },
  },

  template: /*HTML*/ `
    <order-details-page
      v-if="activeView === 'details' && selectedOrder"
      :order="selectedOrder"
      @back="closeOrderDetails"
      @state-change="setOrderState"
      @cancel="cancelSelectedOrder"
      @navigate="$emit('navigate', $event)"
    ></order-details-page>

    <main v-else class="orders-page admin-shell" aria-label="Live orders">
      <app-sidebar active="orders" @navigate="$emit('navigate', $event)" @logout="$emit('logout')"></app-sidebar>

      <div class="admin-main orders-main">
        <app-header title="Live Orders" show-logout @logout="$emit('logout')"></app-header>

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

          <div v-if="errorMessage" class="orders-empty" role="alert">{{ errorMessage }}</div>
          <div v-if="loading" class="orders-empty">Loading orders...</div>

          <div v-if="activeOrders.length" class="orders-list active-orders-list">
            <order-card
              v-for="order in activeOrders"
              :key="order.id"
              :order="order"
              @open="openOrder(order)"
              @cancel="cancelOrder(order)"
              @state-change="changeState(order, $event)"
            ></order-card>
          </div>
          <div v-else class="orders-empty">No active orders found</div>

          <div class="orders-section-head history-section-head">
            <h2>Order History</h2>
            <span class="history-period">Today <span class="material-symbols-outlined">keyboard_arrow_down</span></span>
          </div>

          <div class="orders-list history-orders-list">
            <order-card
              v-for="order in historyOrders"
              :key="order.id"
              :order="order"
              history
              @open="openOrder(order)"
            ></order-card>
          </div>
        </div>
      </div>

      <bottom-navigation active="orders" @navigate="$emit('navigate', $event)"></bottom-navigation>
    </main>
  `,
};
