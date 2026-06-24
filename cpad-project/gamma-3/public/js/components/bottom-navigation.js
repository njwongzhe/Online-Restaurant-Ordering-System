export default {
  name: 'BottomNavigation',

  props: {
    active: { type: String, default: 'menu' },
    destinations: { type: Array },
  },

  emits: ['navigate'],

  computed: {
    computedDestinations() {
      if (this.destinations && this.destinations.length > 0) return this.destinations;
      
      const role = localStorage.getItem('role') || 'customer';
      const items = [
        { id: 'menu', label: 'Menu', icon: 'lunch_dining' },
        { id: 'orders', label: 'Orders', icon: 'receipt_long' },
        { id: 'profile', label: 'Profile', icon: 'person' },
      ];
      
      if (role === 'admin') {
        items.splice(2, 0, { id: 'admin', label: 'Admin', icon: 'admin_panel_settings' });
      }
      return items;
    }
  },

  template: /*HTML*/`
    <nav class="global-bottom-nav" aria-label="Main navigation">
      <button
        v-for="destination in computedDestinations"
        :key="destination.id"
        class="global-nav-item"
        :class="{ active: active === destination.id }"
        :aria-current="active === destination.id ? 'page' : null"
        type="button"
        @click="$emit('navigate', destination.id)"
      >
        <span class="material-symbols-outlined global-nav-icon">{{ destination.icon }}</span>
        <span class="global-nav-label">{{ destination.label }}</span>
      </button>
    </nav>
  `,
};
