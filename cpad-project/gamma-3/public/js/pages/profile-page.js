export default {
  name: 'ProfilePage',
  
  emits: ['navigate', 'logout'], 

  data() {
    return {
      isLoading: true,
      user: {
        id: '',
        name: '',
        phone: '',
        defaultPaymentMethod: '',
        defaultAddress: ''
      }
    };
  },

  computed: {
    isAdmin() {
      return (localStorage.getItem('role') || 'customer') === 'admin';
    },
    defaultPaymentMethodLabel() {
      const labels = {
        'cash': 'Cash',
        'e_wallet': 'E-Wallet',
        'online_banking': 'Online Banking'
      };
      return labels[this.user.defaultPaymentMethod] || 'Cash';
    },
    defaultAddressTruncated() {
      if (!this.user.defaultAddress) return 'Not Set';
      if (this.user.defaultAddress.length > 20) {
        return this.user.defaultAddress.substring(0, 17) + '...';
      }
      return this.user.defaultAddress;
    }
  },

  async mounted() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
       this.$emit('navigate', 'login');
       return;
    }
    
    try {
      const response = await fetch('../api/user/profile', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token 
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        this.user.name = result.data.display_name;
        this.user.phone = result.data.phone_number;
        this.user.id = result.data.user_id;
        this.user.defaultPaymentMethod = result.data.default_payment_method || 'cash';
        this.user.defaultAddress = result.data.default_address || '';
      } else {
        console.error("Database fetch failed.");
        if (response.status === 401) {
            this.logout();
        }
      }
    } catch(err) {
      console.error("Network error:", err);
    } finally {
      this.isLoading = false;
    }
  },

  methods: {
    handleNavigation(destination) {
      this.$emit('navigate', destination);
    },
    logout() {
      this.$emit('logout'); 
    }
  },

  template: /*HTML*/ `
    <main class="profile-page admin-shell" aria-label="User Profile">
      
      <app-sidebar active="profile" @navigate="handleNavigation" @logout="$emit('logout')"></app-sidebar>

      <div class="admin-main profile-main">
        <app-header title="User Profile" variant="page"></app-header>

        <div class="profile-content">
            
            <div class="desktop-header">
                <h1>User Profile</h1>
                <p>Manage your account settings and preferences.</p>
            </div>

            <div class="profile-layout">
                <div class="profile-sidebar">
                    
                    <div class="user-card">
                      <div class="card-header">
                        <span class="role-badge">{{ isAdmin ? 'Admin' : 'Customer' }}</span>
                        
                        <span class="user-id" v-if="isLoading">#Loading...</span>
                        <span class="user-id" v-else>#{{ user.id }}</span>
                        
                        <span class="material-symbols-outlined edit-icon">edit</span>
                      </div>
                      
                      <h2 class="user-name" v-if="isLoading">Loading...</h2>
                      <h2 class="user-name" v-else>{{ user.name }}</h2>
                      
                      <div class="user-phone">
                        <span class="material-symbols-outlined icon-small">call</span>
                        <span v-if="isLoading">Loading...</span>
                        <span v-else>{{ user.phone }}</span>
                      </div>
                    </div>

                </div>

                <div class="profile-settings">
                    <div class="menu-section" v-if="!isAdmin">
                      <div class="section-divider"><span>DEFAULT</span></div>
                      <div class="menu-list">
                        <a href="#" class="menu-item" @click.prevent="handleNavigation('payment-method')">
                          <div class="menu-left">
                            <span class="material-symbols-outlined text-orange">payments</span>
                            <span>Default Payment Method</span>
                          </div>
                          <div style="display: flex; align-items: center; gap: 8px; color: var(--muted, #888); font-size: 14px; font-weight: 500;">
                            <span>{{ defaultPaymentMethodLabel }}</span>
                            <span class="material-symbols-outlined text-grey">chevron_right</span>
                          </div>
                        </a>
                        <a href="#" class="menu-item" @click.prevent="handleNavigation('delivery-address')">
                          <div class="menu-left">
                            <span class="material-symbols-outlined text-orange">location_on</span>
                            <span>Default Delivery Address</span>
                          </div>
                          <div style="display: flex; align-items: center; gap: 8px; color: var(--muted, #888); font-size: 14px; font-weight: 500;">
                            <span>{{ defaultAddressTruncated }}</span>
                            <span class="material-symbols-outlined text-grey">chevron_right</span>
                          </div>
                        </a>
                      </div>
                    </div>

                    <div class="menu-section">
                      <div class="section-divider"><span>ACCOUNT</span></div>
                      <div class="menu-list">
                        <a href="#" class="menu-item" @click.prevent="handleNavigation('change-phone')">
                          <div class="menu-left">
                            <span class="material-symbols-outlined text-orange">dialpad</span>
                            <span>Change Phone Number</span>
                          </div>
                          <span class="material-symbols-outlined text-grey">chevron_right</span>
                        </a>
                        <a href="#" class="menu-item" @click.prevent="handleNavigation('reset-password')">
                          <div class="menu-left">
                            <span class="material-symbols-outlined text-orange">history</span>
                            <span>Reset Password</span>
                          </div>
                          <span class="material-symbols-outlined text-grey">chevron_right</span>
                        </a>
                        <a href="#" class="menu-item" @click.prevent="logout">
                          <div class="menu-left">
                            <span class="material-symbols-outlined text-orange">logout</span>
                            <span>Logout</span>
                          </div>
                          <span class="material-symbols-outlined text-grey">chevron_right</span>
                        </a>
                      </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <bottom-navigation active="profile" @navigate="handleNavigation"></bottom-navigation>
    </main>
  `
};