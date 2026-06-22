const TYPE_DETAILS = {
  'dine-in': { label: 'Dine-in', icon: 'restaurant' },
  delivery: { label: 'Delivery', icon: 'home' },
  'pick-up': { label: 'Pick-up', icon: 'inventory_2' },
};

export default {
  name: 'OrderCard',

  props: {
    order: { type: Object, required: true },
    history: { type: Boolean, default: false },
  },

  emits: ['open', 'cancel', 'state-change'],

  computed: {
    typeDetails() {
      return TYPE_DETAILS[this.order.type];
    },
  },

  template: /*html*/ `
    <article class="order-card" :class="history ? 'history-order-card' : 'active-order-card'">
      <div class="order-card-main">
        <div class="order-type-icon" :class="{ muted: history }">
          <span class="material-symbols-outlined">{{ typeDetails.icon }}</span>
        </div>
        <div class="order-copy">
          <h3>Order {{ order.id }}</h3>
          <div class="order-status" :class="{ muted: history }">
            {{ history && order.cancelled ? 'Cancelled' : order.state }}
            <span>&middot; {{ typeDetails.label }}</span>
          </div>
          <time>{{ order.date }}<br>{{ order.time }}</time>
        </div>
        <strong class="order-amount">{{ order.amount }}</strong>
        <button class="order-open" type="button" :aria-label="'Open order ' + order.id" @click="$emit('open')">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div v-if="!history" class="order-actions">
        <button class="order-cancel" type="button" @click="$emit('cancel')">Cancel</button>
        <div class="state-control" :aria-label="'Change state for order ' + order.id">
          <button type="button" aria-label="Previous state" :disabled="order.state === 'New'" @click="$emit('state-change', -1)">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <span>{{ order.state }}</span>
          <button type="button" aria-label="Next state" @click="$emit('state-change', 1)">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </article>
  `,
};
