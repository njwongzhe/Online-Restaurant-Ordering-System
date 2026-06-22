export default {
  name: 'AppHeader',

  props: {
    title: { type: String, required: true },
    variant: { type: String, default: 'brand' },
    showBack: { type: Boolean, default: false },
    showLogout: { type: Boolean, default: false },
  },

  emits: ['back', 'logout'],

  template: /*HTML*/ `
    <header class="global-header" :class="'global-header--' + variant">
      <div class="global-header-inner">
        <button v-if="showBack" class="global-header-action" type="button" aria-label="Back" @click="$emit('back')">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <span v-else class="material-symbols-outlined global-header-brand-icon">restaurant</span>

        <h1 class="global-header-title">{{ title }}</h1>

        <button v-if="showLogout" class="global-header-action global-header-logout" type="button" aria-label="Logout" @click="$emit('logout')">
          <span class="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  `,
};
