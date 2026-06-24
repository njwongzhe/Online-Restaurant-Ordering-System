export default {
  name: 'PaymentMethodPage',

  emits: ['navigate', 'back', 'logout'],

  data() {
    return {
      isLoading: true,
      isSaving: false,
      selectedMethod: 'cash',
      successMessage: '',
      errorMessage: '',
      options: [
        { id: 'cash', label: 'Cash', icon: 'payments' },
        { id: 'e_wallet', label: 'E-Wallet', icon: 'account_balance_wallet' },
        { id: 'online_banking', label: 'Online Banking', icon: 'account_balance' }
      ]
    };
  },

  async mounted() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      this.$emit('navigate', 'login');
      return;
    }

    try {
      const response = await fetch('../api/user/payment-method', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (response.ok) {
        const result = await response.json();
        // If the database has a saved method, update our selection
        if (result.data && result.data.default_payment_method) {
            this.selectedMethod = result.data.default_payment_method;
        }
      }
    } catch (err) {
      console.error('Failed to load payment method:', err);
    } finally {
      this.isLoading = false;
    }
  },

  methods: {
    handleNavigation(destination) {
      this.$emit('navigate', destination);
    },
    
    goBack() {
      this.$emit('navigate', 'profile');
    },

    selectMethod(id) {
      this.selectedMethod = id;
      this.successMessage = '';
      this.errorMessage = '';
    },

    async saveMethod() {
      this.isSaving = true;
      this.errorMessage = '';
      this.successMessage = '';

      const token = localStorage.getItem('jwtToken');

      try {
        const response = await fetch('../api/user/payment-method', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
          },
          body: JSON.stringify({ default_payment_method: this.selectedMethod })
        });

        if (response.ok) {
          this.successMessage = 'Payment method saved successfully!';
          setTimeout(() => this.goBack(), 1500);
        } else {
          this.errorMessage = 'Failed to save payment method.';
        }
      } catch (err) {
        this.errorMessage = 'A network error occurred.';
      } finally {
        this.isSaving = false;
      }
    }
  },

  template: /*HTML*/ `
    <main class="profile-page payment-method-page admin-shell" aria-label="Payment Method">
      
      <app-sidebar active="profile" @navigate="handleNavigation" @logout="$emit('logout')"></app-sidebar>

      <div class="admin-main profile-main">
        
        <app-header title="Payment Method" variant="page" show-back @back="goBack"></app-header>

        <div class="profile-content">

            <div v-if="isLoading" style="text-align: center; padding: 40px; color: var(--muted);">
                Loading preferences...
            </div>

            <div v-else class="profile-layout">
                <div class="profile-settings">
                    <div class="menu-section">
                        <p style="color: var(--muted, #888); margin-bottom: 24px; font-size: 15px; font-weight: 500;">Choose your default way to pay for orders.</p>
                        
                        <div class="menu-list" style="margin-bottom: 24px;">
                            <button 
                                v-for="opt in options" 
                                :key="opt.id"
                                class="menu-item" 
                                style="width: 100%; text-align: left; background: white; border: none; border-bottom: 1px solid var(--line); cursor: pointer;"
                                @click="selectMethod(opt.id)"
                            >
                                <div class="menu-left">
                                    <span class="material-symbols-outlined text-orange">{{ opt.icon }}</span>
                                    <span>{{ opt.label }}</span>
                                </div>
                                
                                <span class="material-symbols-outlined text-orange" v-if="selectedMethod === opt.id">check_circle</span>
                                <span class="material-symbols-outlined text-grey" v-else>radio_button_unchecked</span>
                            </button>
                        </div>

                        <p v-if="errorMessage" style="color: #d32f2f; text-align: center; font-weight: 600;">{{ errorMessage }}</p>
                        <p v-if="successMessage" style="color: #2e7d32; text-align: center; font-weight: 600;">{{ successMessage }}</p>

                        <button 
                            @click="saveMethod" 
                            :disabled="isSaving"
                            style="width: 100%; padding: 16px; border-radius: 12px; background: var(--orange, #f25c05); color: white; font-size: 16px; font-weight: 700; border: none; cursor: pointer; transition: opacity 0.2s;"
                            :style="{ opacity: isSaving ? 0.7 : 1 }"
                        >
                            {{ isSaving ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <bottom-navigation active="profile" @navigate="handleNavigation"></bottom-navigation>
    </main>
  `
};