import AuthLoginPage from './pages/auth-login-page.js';
import AuthRegisterPage from './pages/auth-register-page.js';
import MenuPage from './pages/menu-page.js';
import OrdersPage from './pages/orders-page.js';
import CartPage from './pages/cart-page.js';
import AppHeader from './components/header.js';
import BottomNavigation from './components/bottom-navigation.js';
import AppSidebar from './components/sidebar.js';
import MenuItemCard from './components/menu-item-card.js';
import OrderCard from './components/order-card.js';
import OrderTimeline from './components/order-timeline.js';
import CartButton from './components/cart-button.js';
import ProfilePage from './pages/profile-page.js';
import { logout } from './services/auth-service.js';

const app = Vue.createApp({
  components: { AuthLoginPage, AuthRegisterPage, MenuPage, OrdersPage, CartPage, ProfilePage },

  data() {
    const hasToken = !!localStorage.getItem('jwtToken');
    return { currentPage: hasToken ? 'menu' : 'login' };
  },

  methods: {
    navigate(destination) {
      if (destination === 'menu' || destination === 'orders' || destination === 'login' || destination === 'register' || destination === 'cart' || destination === 'profile') {
        this.currentPage = destination;
      }
    },
    async logout() {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('displayName');
      localStorage.removeItem('role');
      localStorage.removeItem('position');
      try {
        await logout();
      } catch (error) {
        // Ignore logout request errors
      }
      this.currentPage = 'login';
    }
  },

  template:/*html*/ `
    <auth-login-page v-if="currentPage === 'login'" @navigate="navigate"></auth-login-page>
    <auth-register-page v-else-if="currentPage === 'register'" @navigate="navigate"></auth-register-page>
    <menu-page v-else-if="currentPage === 'menu'" @navigate="navigate" @logout="logout"></menu-page>
    <orders-page v-else-if="currentPage === 'orders'" @navigate="navigate" @logout="logout"></orders-page>
    <cart-page v-else-if="currentPage === 'cart'" @navigate="navigate" @logout="logout"></cart-page>
    <profile-page v-else-if="currentPage === 'profile'" @navigate="navigate" @logout="logout"></profile-page>
  `,
});

app.component('app-header', AppHeader);
app.component('bottom-navigation', BottomNavigation);
app.component('app-sidebar', AppSidebar);
app.component('menu-item-card', MenuItemCard);
app.component('order-card', OrderCard);
app.component('order-timeline', OrderTimeline);
app.component('cart-button', CartButton);
app.component('profile-page', ProfilePage);
app.mount('#app');
