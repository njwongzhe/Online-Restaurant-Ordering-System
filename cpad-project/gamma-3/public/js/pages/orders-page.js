import OrderDetailsPage from './order-details-page.js';
import CancelOrderDialog from '../components/cancel-order-dialog.js';
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

function matchesOrderFilter(order, filter) {
  if (filter === 'all') return true;
  if (filter === 'Cancelled') return order.state === 'Cancelled';
  if (filter === 'Completed') return order.state === 'Completed' && !order.cancelled;
  return order.state === filter && !order.cancelled;
}

function isHistoryOrder(order) {
  return order.state === 'Completed' || order.state === 'Cancelled';
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default {
  name: 'OrdersPage',
  components: { OrderDetailsPage, CancelOrderDialog },
  emits: ['navigate', 'state-change', 'logout'],

  data() {
    return {
      orders: [],
      searchQuery: '',
      activeFilter: 'all',
      filters: ['all', 'New', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
      activeView: 'orders',
      selectedOrder: null,
      cancellationOrder: null,
      cancellingOrder: false,
      loading: true,
      errorMessage: '',
      activeExpanded: true,
      historyExpanded: true,
      periodOpen: false,
      historyStartDate: '',
      historyEndDate: '',
      calendarCursor: new Date(),
    };
  },

  async mounted() {
    await this.refreshOrders();
    this.startPolling();
  },

  beforeUnmount() {
    this.stopPolling();
  },

  computed: {
    activeOrders() {
      const keyword = this.searchQuery.trim().toLowerCase();
      return this.orders.filter((order) => {
        if (isHistoryOrder(order)) return false;
        return matchesOrderFilter(order, this.activeFilter) && matchesOrderSearch(order, keyword);
      });
    },

    historyOrders() {
      const keyword = this.searchQuery.trim().toLowerCase();
      return this.orders.filter((order) => {
        if (!isHistoryOrder(order)
          || !matchesOrderFilter(order, this.activeFilter)
          || !matchesOrderSearch(order, keyword)) return false;
        if (!this.historyStartDate) return true;
        if (!this.historyEndDate) return order.createdDate === this.historyStartDate;
        return order.createdDate >= this.historyStartDate && order.createdDate <= this.historyEndDate;
      });
    },

    historyPeriodLabel() {
      if (!this.historyStartDate) return 'All dates';
      if (!this.historyEndDate) return this.formatPeriodDate(this.historyStartDate);
      return `${this.formatPeriodDate(this.historyStartDate)} – ${this.formatPeriodDate(this.historyEndDate)}`;
    },

    calendarMonthLabel() {
      return this.calendarCursor.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
    },

    calendarDays() {
      const year = this.calendarCursor.getFullYear();
      const month = this.calendarCursor.getMonth();
      const leadingBlanks = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days = Array.from({ length: leadingBlanks }, (_, index) => ({ key: `blank-${index}`, blank: true }));

      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        days.push({ key: dateKey(date), day, blank: false });
      }
      while (days.length % 7 !== 0) days.push({ key: `blank-${days.length}`, blank: true });
      return days;
    },
  },

  methods: {
    async refreshOrders() {
      this.loading = true;
      try { this.orders = await loadOrders(); this.errorMessage = ''; }
      catch (error) { this.errorMessage = error.message; }
      finally { this.loading = false; }
    },

    async refreshOrdersSilent() {
      try {
        const newOrders = await loadOrders();
        this.orders = newOrders;
        if (this.selectedOrder) {
          const updated = this.orders.find(o => o.databaseId === this.selectedOrder.databaseId);
          if (updated) {
            this.selectedOrder = updated;
          }
        }
        this.errorMessage = '';
      } catch (error) {
        console.error('Silent refresh failed:', error);
      }
    },

    startPolling() {
      this.pollingInterval = setInterval(async () => {
        const hasActive = this.orders.some(o => o.state !== 'Completed' && o.state !== 'Cancelled');
        if (hasActive || (this.selectedOrder && this.selectedOrder.state !== 'Completed' && this.selectedOrder.state !== 'Cancelled')) {
          await this.refreshOrdersSilent();
        }
      }, 8000);
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
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

    requestCancel(order) {
      this.cancellationOrder = order;
    },

    closeCancelDialog() {
      if (!this.cancellingOrder) this.cancellationOrder = null;
    },

    async confirmCancellation(reason) {
      const order = this.cancellationOrder;
      if (!order) return;
      this.cancellingOrder = true;
      try {
        await cancelOrderRequest(order.databaseId, reason);
        order.state = 'Cancelled';
        order.cancelled = true;
        order.cancellationReason = reason;
        this.cancellationOrder = null;
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.cancellingOrder = false;
      }
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

    cancelSelectedOrder(order) {
      this.requestCancel(order);
    },

    changeCalendarMonth(offset) {
      this.calendarCursor = new Date(
        this.calendarCursor.getFullYear(),
        this.calendarCursor.getMonth() + offset,
        1,
      );
    },

    selectHistoryDate(selectedDate) {
      if (!this.historyStartDate || this.historyEndDate) {
        this.historyStartDate = selectedDate;
        this.historyEndDate = '';
        return;
      }

      if (selectedDate < this.historyStartDate) {
        this.historyEndDate = this.historyStartDate;
        this.historyStartDate = selectedDate;
      } else if (selectedDate > this.historyStartDate) {
        this.historyEndDate = selectedDate;
      }
    },

    calendarDayClasses(day) {
      if (day.blank) return {};
      return {
        today: day.key === dateKey(new Date()),
        'range-start': day.key === this.historyStartDate,
        'range-end': day.key === this.historyEndDate,
        'in-range': this.historyStartDate && this.historyEndDate
          && day.key > this.historyStartDate && day.key < this.historyEndDate,
      };
    },

    clearHistoryPeriod() {
      this.historyStartDate = '';
      this.historyEndDate = '';
      this.periodOpen = false;
    },

    formatPeriodDate(value) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day).toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
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
      @logout="$emit('logout')"
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
            <div class="orders-section-title-group">
              <button
                class="orders-section-toggle"
                type="button"
                :aria-expanded="activeExpanded"
                aria-controls="active-orders-section"
                :aria-label="activeExpanded ? 'Collapse active orders' : 'Expand active orders'"
                @click="activeExpanded = !activeExpanded"
              >
                <span class="material-symbols-outlined">{{ activeExpanded ? 'keyboard_arrow_down' : 'chevron_right' }}</span>
              </button>
              <h2>Active</h2>
            </div>
            <span class="orders-count">{{ activeOrders.length }} active</span>
          </div>

          <div v-if="errorMessage" class="orders-empty" role="alert">{{ errorMessage }}</div>
          <div v-if="loading" class="orders-empty">Loading orders...</div>

          <template v-else>
            <div v-if="activeExpanded && activeOrders.length" id="active-orders-section" class="orders-list active-orders-list">
              <order-card
                v-for="order in activeOrders"
                :key="order.id"
                :order="order"
                @open="openOrder(order)"
                @cancel="requestCancel(order)"
                @state-change="changeState(order, $event)"
              ></order-card>
            </div>
            <div v-else-if="activeExpanded" id="active-orders-section" class="orders-empty">No active orders found.</div>
          </template>

          <div class="history-section-controls">
          <div class="orders-section-head history-section-head">
            <div class="orders-section-title-group">
              <button
                class="orders-section-toggle"
                type="button"
                :aria-expanded="historyExpanded"
                aria-controls="history-orders-section"
                :aria-label="historyExpanded ? 'Collapse order history' : 'Expand order history'"
                @click="historyExpanded = !historyExpanded"
              >
                <span class="material-symbols-outlined">{{ historyExpanded ? 'keyboard_arrow_down' : 'chevron_right' }}</span>
              </button>
              <h2>History</h2>
            </div>

            <div class="history-period-control">
              <button
                class="history-period"
                type="button"
                :aria-expanded="periodOpen"
                aria-controls="history-period-picker"
                @click="periodOpen = !periodOpen"
              >
                <span class="material-symbols-outlined">calendar_month</span>
                <span>{{ historyPeriodLabel }}</span>
              </button>
            </div>
          </div>

          <div v-if="periodOpen" id="history-period-picker" class="history-period-picker" @keydown.esc="periodOpen = false">
                <div class="history-picker-heading">
                  <span class="material-symbols-outlined">date_range</span>
                  <div>
                    <strong>Choose period</strong>
                    <span>Filter completed orders</span>
                  </div>
                </div>

                <div class="history-selection-summary" aria-live="polite">
                  <div :class="{ selected: historyStartDate }">
                    <span>From</span>
                    <strong>{{ historyStartDate ? formatPeriodDate(historyStartDate) : 'Select date' }}</strong>
                  </div>
                  <span class="material-symbols-outlined">arrow_forward</span>
                  <div :class="{ selected: historyEndDate }">
                    <span>To</span>
                    <strong>{{ historyEndDate ? formatPeriodDate(historyEndDate) : 'Optional' }}</strong>
                  </div>
                </div>

                <div class="history-calendar">
                  <div class="history-calendar-head">
                    <button type="button" aria-label="Previous month" @click="changeCalendarMonth(-1)">
                      <span class="material-symbols-outlined">chevron_left</span>
                    </button>
                    <strong>{{ calendarMonthLabel }}</strong>
                    <button type="button" aria-label="Next month" @click="changeCalendarMonth(1)">
                      <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                  <div class="history-calendar-grid history-calendar-weekdays" aria-hidden="true">
                    <span v-for="(weekday, index) in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="index">{{ weekday }}</span>
                  </div>
                  <div class="history-calendar-grid" role="grid" :aria-label="calendarMonthLabel">
                    <template v-for="day in calendarDays" :key="day.key">
                      <span v-if="day.blank" class="history-calendar-blank"></span>
                      <button
                        v-else
                        class="history-calendar-day"
                        :class="calendarDayClasses(day)"
                        type="button"
                        :aria-label="formatPeriodDate(day.key)"
                        :aria-pressed="day.key === historyStartDate || day.key === historyEndDate"
                        @click="selectHistoryDate(day.key)"
                      >{{ day.day }}</button>
                    </template>
                  </div>
                </div>
                <p>One date shows a single day. Add a second date for a range.</p>
                <div class="history-period-actions">
                  <button type="button" @click="clearHistoryPeriod">Clear</button>
                  <button class="apply" type="button" :disabled="!historyStartDate" @click="periodOpen = false">Apply</button>
                </div>
          </div>
          </div>

          <div v-if="loading" class="orders-empty">Loading history...</div>

          <template v-else>
            <div v-if="historyExpanded && historyOrders.length" id="history-orders-section" class="orders-list history-orders-list">
              <order-card
                v-for="order in historyOrders"
                :key="order.id"
                :order="order"
                history
                @open="openOrder(order)"
              ></order-card>
            </div>
            <div v-else-if="historyExpanded" id="history-orders-section" class="orders-empty">No history orders found for this period</div>
          </template>
        </div>
      </div>

      <bottom-navigation active="orders" @navigate="$emit('navigate', $event)"></bottom-navigation>
    </main>

    <cancel-order-dialog
      v-if="cancellationOrder"
      :order="cancellationOrder"
      :submitting="cancellingOrder"
      @close="closeCancelDialog"
      @confirm="confirmCancellation"
    ></cancel-order-dialog>
  `,
};
