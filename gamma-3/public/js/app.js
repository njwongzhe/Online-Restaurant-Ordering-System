import MenuPage from './pages/menu-page.js';
import OrdersPage from './pages/orders-page.js';
import AppHeader from './components/header.js';
import BottomNavigation from './components/bottom-navigation.js';
import AppSidebar from './components/sidebar.js';
import MenuItemCard from './components/menu-item-card.js';
import OrderCard from './components/order-card.js';
import OrderTimeline from './components/order-timeline.js';

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

  template:/*html*/ `
    <menu-page v-if="currentPage === 'menu'" @navigate="navigate"></menu-page>
    <orders-page v-else-if="currentPage === 'orders'" @navigate="navigate"></orders-page>
  `,
});

app.component('app-header', AppHeader);
app.component('bottom-navigation', BottomNavigation);
app.component('app-sidebar', AppSidebar);
app.component('menu-item-card', MenuItemCard);
app.component('order-card', OrderCard);
app.component('order-timeline', OrderTimeline);
app.mount('#app');
