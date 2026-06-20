const ORDER_STATES = ['New', 'Preparing', 'Ready', 'Completed'];

const TIMELINES = {
  'dine-in': [
    { title: 'Order Confirmed', icon: 'check' },
    { title: 'Preparing Meal', icon: 'skillet' },
    { title: 'Ready to Serve', icon: 'room_service' },
    { title: 'Served', icon: 'restaurant' },
  ],
  delivery: [
    { title: 'Order Confirmed', icon: 'check' },
    { title: 'Preparing Meal', icon: 'skillet' },
    { title: 'Ready for Delivery', icon: 'delivery_dining' },
    { title: 'Delivered', icon: 'home' },
  ],
  'pick-up': [
    { title: 'Order Confirmed', icon: 'check' },
    { title: 'Preparing Meal', icon: 'skillet' },
    { title: 'Ready for Pick-up', icon: 'shopping_bag' },
    { title: 'Picked Up', icon: 'inventory_2' },
  ],
};

export default {
  name: 'OrderDetailsPage',
  props: {
    order: { type: Object, required: true },
  },

  emits: ['back', 'state-change', 'cancel', 'navigate'],

  computed: {
    stateIndex() {
      return ORDER_STATES.indexOf(this.order.state);
    },

    timeline() {
      return TIMELINES[this.order.type].map((step, index) => ({
        ...step,
        state: ORDER_STATES[index],
        pending: index > this.stateIndex,
        subtitle: index < this.stateIndex
          ? 'Completed'
          : index === this.stateIndex
            ? 'In progress'
            : 'Pending',
      }));
    },

    typeLabel() {
      if (this.order.type === 'dine-in') return 'Dine-in';
      if (this.order.type === 'pick-up') return 'Pick-up';
      return 'Delivery';
    },
  },

  methods: {
    changeState(direction) {
      const nextIndex = Math.max(0, Math.min(ORDER_STATES.length - 1, this.stateIndex + direction));
      if (nextIndex === this.stateIndex) return;
      this.$emit('state-change', { orderId: this.order.id, state: ORDER_STATES[nextIndex] });
    },

    handleNavigation(destination) {
      if (destination === 'orders') this.$emit('back');
      else this.$emit('navigate', destination);
    },

    money(value) {
      return `$${Number(value).toFixed(2)}`;
    },
  },

  template: `
    <main class="order-details-page admin-shell" aria-label="Order details">
      <app-sidebar active="orders" @navigate="handleNavigation"></app-sidebar>

      <div class="admin-main order-details-main">
        <app-header title="Order Status" variant="page" show-back @back="$emit('back')"></app-header>

        <div class="order-details-container">
          <section class="order-details-hero" aria-label="Current order status">
            <p>Order ID: {{ order.id }}</p>
            <h1>{{ order.state }}</h1>
            <span>{{ order.date }} &middot; {{ order.time }} &middot; {{ typeLabel }}</span>
          </section>

          <order-timeline :steps="timeline"></order-timeline>

          <section class="order-summary-section">
            <h2 class="order-detail-section-title">Order Summary</h2>
            <div class="order-detail-card order-summary-card">
              <div v-for="item in order.items" :key="item.id" class="order-summary-item">
                <img :src="item.image" :alt="item.name" />
                <div>
                  <h3>{{ item.quantity }}&times; {{ item.name }}</h3>
                  <p>{{ item.note }}</p>
                </div>
                <strong>{{ money(item.price) }}</strong>
              </div>

              <div class="order-detail-totals">
                <div><span>Subtotal</span><strong>{{ money(order.subtotal) }}</strong></div>
                <div v-for="fee in order.fees" :key="fee.label"><span>{{ fee.label }}</span><strong>{{ money(fee.amount) }}</strong></div>
                <div class="order-grand-total"><span>Total</span><strong>{{ money(order.total) }}</strong></div>
              </div>
            </div>
          </section>

          <section class="order-fulfilment-section">
            <h2 class="order-detail-section-title">{{ order.fulfilment.title }}</h2>
            <div class="order-detail-card order-fulfilment-card">
              <div v-for="row in order.fulfilment.rows" :key="row.title" class="order-fulfilment-row">
                <span class="material-symbols-outlined">{{ row.icon }}</span>
                <div><h3>{{ row.title }}</h3><p>{{ row.subtitle }}</p></div>
              </div>
            </div>
          </section>

          <section class="order-detail-actions" aria-label="Order actions">
            <button class="order-detail-cancel" type="button" @click="$emit('cancel', order)">Cancel</button>
            <div class="order-detail-state-control">
              <button type="button" aria-label="Previous state" :disabled="stateIndex === 0" @click="changeState(-1)">
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <strong>{{ order.state }}</strong>
              <button type="button" aria-label="Next state" :disabled="stateIndex === 3" @click="changeState(1)">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      <bottom-navigation active="orders" @navigate="handleNavigation"></bottom-navigation>
    </main>
  `,
};
