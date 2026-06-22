export default {
  name: 'BottomNavigation',

  props: {
    active: { type: String, default: 'menu' },
    destinations: {
      type: Array,
      default: () => [
        { id: 'menu', label: 'Menu', icon: 'lunch_dining' },
        { id: 'orders', label: 'Orders', icon: 'receipt_long' },
        { id: 'admin', label: 'Admin', icon: 'admin_panel_settings' },
        { id: 'profile', label: 'Profile', icon: 'person' },
      ],
    },
  },

  emits: ['navigate'],

  template: /*html*/ `
    <nav class="global-bottom-nav" aria-label="Main navigation">
      <button
        v-for="destination in destinations"
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
