import MenuPage from './components/admin/menu-page.js';
import OrdersPage from './components/admin/orders-page.js';
import AppHeader from './components/header.js';
import BottomNavigation from './components/bottom-navigation.js';

const app = Vue.createApp({
  components: { MenuPage, OrdersPage },

  data() {
    return { currentPage: 'menu' };
  },

  methods: {
    navigate(destination) {
      if (destination === 'menu' || destination === 'orders') this.currentPage = destination;
    },
  },

  template: `
    <menu-page v-if="currentPage === 'menu'" @navigate="navigate"></menu-page>
    <orders-page v-else-if="currentPage === 'orders'" @navigate="navigate"></orders-page>
  `,
});

app.component('app-header', AppHeader);
app.component('bottom-navigation', BottomNavigation);
app.mount('#app');
