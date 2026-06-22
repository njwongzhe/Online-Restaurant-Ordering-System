export default {
  name: 'AppSidebar',

  props: {
    active: { type: String, default: 'menu' },
    links: { type: Array },
    workspaceLabel: { type: String },
    profileName: { type: String },
    profileRole: { type: String },
    profileInitials: { type: String },
  },

  emits: ['navigate', 'logout'],

  computed: {
    computedLinks() {
      if (this.links && this.links.length > 0) return this.links;
      
      const role = localStorage.getItem('role') || 'admin';
      const items = [
        { id: 'menu', label: 'Menu', icon: 'lunch_dining' },
        { id: 'orders', label: 'Orders', icon: 'receipt_long' },
        { id: 'profile', label: 'Profile', icon: 'person' },
      ];
      
      if (role === 'admin') {
        items.splice(2, 0, { id: 'admin', label: 'Admin', icon: 'admin_panel_settings' });
      }
      return items;
    },

    displayWorkspaceLabel() {
      if (this.workspaceLabel) return this.workspaceLabel;
      const role = localStorage.getItem('role');
      return role === 'admin' ? 'Admin workspace' : 'Customer portal';
    },

    displayName() {
      if (this.profileName) return this.profileName;
      return localStorage.getItem('displayName') || 'Aina Rahman';
    },

    displayRole() {
      if (this.profileRole) return this.profileRole;
      const role = localStorage.getItem('role');
      if (role === 'admin') return localStorage.getItem('position') || 'Restaurant Manager';
      if (role === 'customer') return 'Customer';
      return role || 'Guest';
    },

    displayInitials() {
      if (this.profileInitials) return this.profileInitials;
      const name = this.displayName;
      return name.split(' ').filter(Boolean).map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'U';
    }
  },

  template: /*HTML*/`
    <aside class="desktop-sidebar" aria-label="Admin sidebar">
      <div class="sidebar-brand">
        <span class="material-symbols-outlined">restaurant</span>
        <span>Lanita Restaurant</span>
      </div>

      <p class="sidebar-label">{{ displayWorkspaceLabel }}</p>
      <nav class="sidebar-nav">
        <button
          v-for="link in computedLinks"
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
        <span class="sidebar-avatar">{{ displayInitials }}</span>
        <div class="sidebar-profile-copy">
          <strong>{{ displayName }}</strong>
          <span>{{ displayRole }}</span>
        </div>
        <button class="sidebar-logout" type="button" aria-label="Logout" @click="$emit('logout')">
          <span class="material-symbols-outlined">logout</span>
        </button>
      </div>
    </aside>
  `,
};
