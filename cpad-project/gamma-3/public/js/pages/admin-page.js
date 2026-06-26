import AdminStatsCard from '../components/admin-stats-card.js';

export default {
  name: 'AdminPage',

  components: { AdminStatsCard },

  emits: ['navigate', 'logout'],

  data() {
    return {
      orders: [],
      filterPeriod: 'today',
      loading: true,
      
      // Global settings
      restaurant_address: '',
      service_fee: 0,
      packaging_fee: 0,
      delivery_fee: 0,
      restaurant_open: false,
      
      // Settings modals
      activeModal: null, // null, 'restaurant_address', 'service_fee', 'packaging_fee', 'delivery_fee'
      modalValue: '',
      modalError: '',
      savingSetting: false,

      // User Management
      userSearchQuery: '',
      usersList: [],
      displayAllUsers: false,
      loadingUsers: false
    };
  },

  computed: {
    stats() {
      // Get local today date string YYYY-MM-DD
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      const filtered = this.orders.filter(order => {
        if (this.filterPeriod === 'today') {
          return order.created_at && order.created_at.indexOf(todayStr) === 0;
        }
        return true; // all_time
      });

      let revenue = 0;
      let dineIn = 0;
      let takeaway = 0;
      let delivery = 0;

      filtered.forEach(order => {
        if (order.order_status !== 'cancelled') {
          revenue += Number(order.total_amount || 0);
        }
        if (order.order_type === 'dine_in') {
          dineIn++;
        } else if (order.order_type === 'takeaway') {
          takeaway++;
        } else if (order.order_type === 'delivery') {
          delivery++;
        }
      });

      return { revenue, dineIn, takeaway, delivery };
    },

    visibleUsers() {
      if (this.displayAllUsers) {
        return this.usersList;
      }
      return this.usersList.slice(0, 4);
    },

    modalTitle() {
      const titles = {
        'restaurant_address': 'Restaurant Address',
        'service_fee': 'Service Fee Rates (%)',
        'packaging_fee': 'Packaging Fee (Per Item)',
        'delivery_fee': 'Delivery Fee (Per Order)'
      };
      return titles[this.activeModal] || '';
    },

    modalDesc() {
      const descs = {
        'restaurant_address': 'Enter the default pickup location and delivery origin for the restaurant.',
        'service_fee': 'Specify the service fee percentage to be charged per order subtotal.',
        'packaging_fee': 'Specify the packaging fee charged per menu item ordered.',
        'delivery_fee': 'Specify the standard flat delivery fee applied per delivery order.'
      };
      return descs[this.activeModal] || '';
    }
  },

  async mounted() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      this.$emit('navigate', 'login');
      return;
    }

    this.loading = true;
    try {
      const [ordersRes, settingsRes, usersRes] = await Promise.all([
        fetch('../api/orders', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
        }),
        fetch('../api/admin/settings', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
        }),
        fetch('../api/admin/users', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
        })
      ]);

      if (ordersRes.ok) {
        const result = await ordersRes.json();
        this.orders = result.orders || [];
      } else if (ordersRes.status === 401) {
        this.$emit('logout');
        return;
      }

      if (settingsRes.ok) {
        const result = await settingsRes.json();
        const settings = result.settings || [];
        settings.forEach(s => {
          if (s.setting_key === 'restaurant_address') this.restaurant_address = s.setting_value;
          if (s.setting_key === 'service_fee') this.service_fee = Number(s.setting_value);
          if (s.setting_key === 'packaging_fee') this.packaging_fee = Number(s.setting_value);
          if (s.setting_key === 'delivery_fee') this.delivery_fee = Number(s.setting_value);
          if (s.setting_key === 'restaurant_open') this.restaurant_open = s.setting_value === 'true' || s.setting_value === '1';
        });
      }

      if (usersRes.ok) {
        const result = await usersRes.json();
        this.usersList = result.users || [];
      }
    } catch (err) {
      console.error('Network error initializing admin workspace:', err);
    } finally {
      this.loading = false;
    }
  },

  methods: {
    handleNavigation(destination) {
      this.$emit('navigate', destination);
    },

    handlePeriodChange(newPeriod) {
      this.filterPeriod = newPeriod;
    },

    // Settings management
    openSettingModal(key, currentVal) {
      if (this.loading) return;
      this.activeModal = key;
      this.modalValue = currentVal;
      this.modalError = '';
    },

    async saveSetting() {
      const token = localStorage.getItem('jwtToken');
      if (!token) return;

      let val = String(this.modalValue).trim();
      if (this.activeModal !== 'restaurant_address') {
        const num = Number(val);
        if (isNaN(num) || num < 0) {
          this.modalError = 'Please enter a valid positive number.';
          return;
        }
        val = num.toString();
      } else {
        if (!val) {
          this.modalError = 'Address cannot be empty.';
          return;
        }
      }

      this.savingSetting = true;
      this.modalError = '';
      try {
        const response = await fetch('../api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ key: this.activeModal, value: val })
        });

        if (response.ok) {
          if (this.activeModal === 'restaurant_address') this.restaurant_address = val;
          if (this.activeModal === 'service_fee') this.service_fee = Number(val);
          if (this.activeModal === 'packaging_fee') this.packaging_fee = Number(val);
          if (this.activeModal === 'delivery_fee') this.delivery_fee = Number(val);
          this.activeModal = null;
        } else {
          this.modalError = 'Failed to save setting.';
        }
      } catch (err) {
        this.modalError = 'Network error saving setting.';
      } finally {
        this.savingSetting = false;
      }
    },

    async toggleRestaurantOpen() {
      if (this.loading) return;
      const token = localStorage.getItem('jwtToken');
      if (!token) return;

      const nextVal = !this.restaurant_open;
      // Optimistic update
      this.restaurant_open = nextVal;
      try {
        const response = await fetch('../api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ key: 'restaurant_open', value: nextVal ? 'true' : 'false' })
        });

        if (!response.ok) {
          // Revert on failure
          this.restaurant_open = !nextVal;
        }
      } catch (err) {
        this.restaurant_open = !nextVal;
        console.error('Network error toggling open status:', err);
      }
    },

    // User management
    async searchUsers() {
      const token = localStorage.getItem('jwtToken');
      if (!token) return;

      this.loadingUsers = true;
      try {
        const url = '../api/admin/users' + (this.userSearchQuery ? '?search=' + encodeURIComponent(this.userSearchQuery) : '');
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
        });

        if (response.ok) {
          const result = await response.json();
          this.usersList = result.users || [];
        }
      } catch (err) {
        console.error('Failed to search users:', err);
      } finally {
        this.loadingUsers = false;
      }
    },

    async toggleUserRole(user) {
      const token = localStorage.getItem('jwtToken');
      if (!token) return;

      const nextRole = user.role === 'admin' ? 'customer' : 'admin';
      try {
        const response = await fetch(`../api/admin/users/${user.user_id}/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ role: nextRole })
        });

        if (response.ok) {
          user.role = nextRole;
        } else {
          console.error('Failed to update user role');
        }
      } catch (err) {
        console.error('Network error updating role:', err);
      }
    }
  },

  template: /*HTML*/ `
    <main class="admin-page admin-shell" aria-label="Admin Workspace">
      <app-sidebar active="admin" @navigate="handleNavigation" @logout="$emit('logout')"></app-sidebar>
      
      <div class="admin-main admin-content-main">
        <app-header title="Admin Management" variant="page" :show-logout="true" @logout="$emit('logout')"></app-header>
        
        <div class="admin-content">
          <div class="desktop-header">
            <h1>Admin Management</h1>
            <p>Monitor metrics and manage global settings.</p>
          </div>
          
          
          <admin-stats-card
            :revenue="stats.revenue"
            :dine-in="stats.dineIn"
            :takeaway="stats.takeaway"
            :delivery="stats.delivery"
            :period="filterPeriod"
            :loading="loading"
            @period-change="handlePeriodChange"
          ></admin-stats-card>
          
          <!-- GLOBAL SETTINGS -->
          <div class="admin-menu-section">
            <div class="section-divider"><span>GLOBAL</span></div>
            
            <div class="admin-menu-list">
              <a href="#" class="admin-menu-item" :class="{ disabled: loading }" @click.prevent="openSettingModal('restaurant_address', restaurant_address)">
                <div class="admin-menu-left">
                  <span class="material-symbols-outlined">storefront</span>
                  <span>Current Restaurant Address</span>
                </div>
                <span class="material-symbols-outlined">chevron_right</span>
              </a>
              
              <a href="#" class="admin-menu-item" :class="{ disabled: loading }" @click.prevent="openSettingModal('service_fee', service_fee)">
                <div class="admin-menu-left">
                  <span class="material-symbols-outlined">skillet</span>
                  <span>Service Fee Rates (% Per Subtotal)</span>
                </div>
                <span class="material-symbols-outlined">chevron_right</span>
              </a>
              
              <a href="#" class="admin-menu-item" :class="{ disabled: loading }" @click.prevent="openSettingModal('packaging_fee', packaging_fee)">
                <div class="admin-menu-left">
                  <span class="material-symbols-outlined">inventory_2</span>
                  <span>Packaging Fee (Per Item)</span>
                </div>
                <span class="material-symbols-outlined">chevron_right</span>
              </a>

              <a href="#" class="admin-menu-item" :class="{ disabled: loading }" @click.prevent="openSettingModal('delivery_fee', delivery_fee)">
                <div class="admin-menu-left">
                  <span class="material-symbols-outlined">delivery_dining</span>
                  <span>Delivery Fee (Per Order)</span>
                </div>
                <span class="material-symbols-outlined">chevron_right</span>
              </a>

              <div class="admin-menu-item" :class="{ disabled: loading }" style="cursor: default;">
                <div class="admin-menu-left">
                  <span class="material-symbols-outlined">power_settings_new</span>
                  <div>
                    <div style="font-weight: 600;">Restaurant Status</div>
                    <div style="font-size: 12px; color: var(--muted, #888); font-weight: 500;">Set the store to Open or Closed</div>
                  </div>
                </div>
                <label class="status-switch">
                  <input type="checkbox" :checked="restaurant_open" @change="toggleRestaurantOpen" :disabled="loading">
                  <span class="status-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- USER MANAGEMENT -->
          <div class="admin-menu-section">
            <div class="section-divider"><span>USER MANAGEMENT</span></div>
            
            <form class="user-search-wrapper" @submit.prevent="searchUsers">
              <span class="material-symbols-outlined search-icon">search</span>
              <input 
                type="text" 
                v-model="userSearchQuery" 
                class="user-search-input" 
                placeholder="Search users by ID, name or phone..."
                @keyup.enter="searchUsers"
              />
            </form>

            <div v-if="loading || loadingUsers" class="admin-empty">
              Loading users...
            </div>

            <template v-else>
              <div v-if="usersList.length > 0" class="admin-menu-list" style="margin-bottom: 24px;">
                <div 
                  v-for="user in visibleUsers" 
                  :key="user.user_id" 
                  class="user-item-row"
                  :class="{ 'user-item-admin': user.role === 'admin' }"
                >
                  <div class="user-info-left">
                    <div class="user-meta">#{{ user.user_id }} • <span style="text-transform: capitalize;">{{ user.role }}</span></div>
                    <div class="user-display-name">{{ user.display_name }}</div>
                    <div class="user-phone-num">{{ user.phone_number }}</div>
                  </div>
                  <button 
                    type="button" 
                    class="role-change-btn" 
                    :class="user.role === 'admin' ? 'btn-solid' : 'btn-outline'"
                    @click="toggleUserRole(user)"
                  >
                    Change Role
                  </button>
                </div>
              </div>
              
              <div v-else class="admin-empty">
                No users found matching query.
              </div>

              <div style="text-align: center;" v-if="usersList.length > 4">
                <a 
                  href="#" 
                  class="display-all-link" 
                  @click.prevent="displayAllUsers = !displayAllUsers"
                >
                  {{ displayAllUsers ? 'Show Less Users' : 'Display All Users' }}
                  <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">
                    {{ displayAllUsers ? 'arrow_upward' : 'arrow_forward' }}
                  </span>
                </a>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Settings Input Modal -->
      <div class="admin-modal-overlay" v-if="activeModal" @click.self="activeModal = null">
        <div class="admin-modal-content">
          <h3 class="admin-modal-title">{{ modalTitle }}</h3>
          <p class="admin-modal-desc">{{ modalDesc }}</p>
          
          <div style="margin-bottom: 20px;">
            <textarea 
              v-if="activeModal === 'restaurant_address'" 
              v-model="modalValue" 
              rows="3" 
              class="modal-input-field"
              placeholder="Enter restaurant address..."
            ></textarea>
            <input 
              v-else 
              type="text" 
              v-model="modalValue" 
              class="modal-input-field" 
              placeholder="Enter numeric value..."
            />
            <div v-if="modalError" class="modal-error-msg">{{ modalError }}</div>
          </div>

          <div style="display: flex; gap: 12px; justify-content: center;">
            <button 
              class="admin-modal-btn btn-secondary" 
              type="button" 
              :disabled="savingSetting"
              @click="activeModal = null"
            >
              Cancel
            </button>
            <button 
              class="admin-modal-btn" 
              type="button" 
              :disabled="savingSetting"
              @click="saveSetting"
            >
              {{ savingSetting ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
      
      <bottom-navigation active="admin" @navigate="handleNavigation"></bottom-navigation>
    </main>
  `
};
