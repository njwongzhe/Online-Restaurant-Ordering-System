export default {
  name: 'AppSidebar',

  props: {
    active: { type: String, default: 'menu' },
    links: {
      type: Array,
      default: () => [
        { id: 'menu', label: 'Menu', icon: 'lunch_dining' },
        { id: 'orders', label: 'Orders', icon: 'receipt_long' },
        { id: 'admin', label: 'Admin', icon: 'admin_panel_settings' },
        { id: 'profile', label: 'Profile', icon: 'person' },
      ],
    },
    workspaceLabel: { type: String, default: 'Admin workspace' },
    profileName: { type: String, default: 'Aina Rahman' },
    profileRole: { type: String, default: 'Restaurant Manager' },
    profileInitials: { type: String, default: 'AR' },
  },

  emits: ['navigate'],

  template: `
    <aside class="desktop-sidebar" aria-label="Admin sidebar">
      <div class="sidebar-brand">
        <span class="material-symbols-outlined">restaurant</span>
        <span>Lanita Restaurant</span>
      </div>

      <p class="sidebar-label">{{ workspaceLabel }}</p>
      <nav class="sidebar-nav">
        <button
          v-for="link in links"
          :key="link.label"
          class="sidebar-link"
          :class="{ active: active === link.id }"
          :aria-current="active === link.id ? 'page' : null"
          type="button"
          @click="$emit('navigate', link.id)"
        >
          <span class="material-symbols-outlined">{{ link.icon }}</span>
          <span>{{ link.label }}</span>
        </button>
      </nav>

      <div class="sidebar-profile">
        <span class="sidebar-avatar">{{ profileInitials }}</span>
        <div class="sidebar-profile-copy">
          <strong>{{ profileName }}</strong>
          <span>{{ profileRole }}</span>
        </div>
        <button class="sidebar-logout" type="button" aria-label="Logout">
          <span class="material-symbols-outlined">logout</span>
        </button>
      </div>
    </aside>
  `,
};
