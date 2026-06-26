export default {
  name: 'DeliveryAddressPage',

  emits: ['navigate', 'back', 'logout'],

  data() {
    return {
      isLoading: true,
      isSaving: false,
      address: '',
      addressHistory: [],
      successMessage: '',
      errorMessage: ''
    };
  },

  async mounted() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      this.$emit('navigate', 'login');
      return;
    }

    try {
      const response = await fetch('../api/user/address', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          if (result.data.default_address) {
            this.address = result.data.default_address;
          }
          if (result.data.address_history) {
            this.addressHistory = result.data.address_history;
          }
        }
      }
    } catch (err) {
      console.error('Failed to load address:', err);
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

    selectFromHistory(addr) {
      this.address = addr;
    },

    async deleteFromHistory(addr) {
      if (!window.confirm("Remove this address from history?")) return;
      
      const token = localStorage.getItem('jwtToken');
      try {
        const response = await fetch('../api/user/address/history', {
          method: 'DELETE',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
          },
          body: JSON.stringify({ address: addr })
        });
        if (response.ok) {
          const result = await response.json();
          this.addressHistory = result.data.address_history || [];
        }
      } catch (err) {
        console.error('Failed to delete address history:', err);
      }
    },

    async saveAddress() {
      this.isSaving = true;
      this.errorMessage = '';
      this.successMessage = '';

      const token = localStorage.getItem('jwtToken');

      try {
        const response = await fetch('../api/user/address', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
          },
          body: JSON.stringify({ default_address: this.address })
        });

        if (response.ok) {
          this.successMessage = 'Delivery address saved successfully!';
          
          // Instantly update local list of history so it prepends
          const result = await response.json();
          if (result.data && result.data.address_history) {
            this.addressHistory = result.data.address_history;
          }
          
          setTimeout(() => this.goBack(), 1500);
        } else {
          const result = await response.json();
          this.errorMessage = result.error || 'Failed to save delivery address.';
        }
      } catch (err) {
        this.errorMessage = 'A network error occurred.';
      } finally {
        this.isSaving = false;
      }
    }
  },

  template: /*HTML*/ `
    <main class="profile-page delivery-address-page admin-shell" aria-label="Delivery Address">
      
      <app-sidebar active="profile" @navigate="handleNavigation" @logout="$emit('logout')"></app-sidebar>

      <div class="admin-main profile-main">
        
        <app-header title="Delivery Address" variant="page" show-back @back="goBack"></app-header>

        <div class="profile-content">

            <div v-if="isLoading" style="text-align: center; padding: 40px; color: var(--muted);">
                Loading preferences...
            </div>

            <div v-else class="profile-layout">
                <div class="profile-settings">
                    <form @submit.prevent="saveAddress" class="menu-section">
                        <p style="color: var(--muted, #888); margin-bottom: 24px; font-size: 15px; font-weight: 500;">Enter your default delivery address for orders.</p>
                        
                        <div class="input-field" style="margin-bottom: 24px;">
                            <label class="input-box-label" for="address-textarea">Street Address</label>
                            <textarea 
                                id="address-textarea"
                                class="input-box" 
                                v-model="address" 
                                placeholder="Input your address here (e.g. N28)..." 
                                rows="4"
                                style="width: 100%; min-height: 120px; padding: 16px; border-radius: 12px; border: 1px solid var(--line, #e0e0e0); font-family: inherit; font-size: 15px; resize: vertical;"
                                maxlength="500"
                            ></textarea>
                        </div>

                        <!-- Address Choices History -->
                        <div v-if="addressHistory && addressHistory.length > 0" class="address-history-section" style="margin-bottom: 28px;">
                            <p style="color: var(--muted, #888); font-size: 13px; font-weight: 700; margin-bottom: 12px; letter-spacing: 0.5px; text-transform: uppercase;">Previously Used Addresses</p>
                            <div class="menu-list">
                                <div 
                                    v-for="(addr, idx) in addressHistory" 
                                    :key="idx"
                                    class="menu-item"
                                    style="padding: 14px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: white;"
                                    @click="selectFromHistory(addr)"
                                >
                                    <div class="menu-left" style="flex: 1; min-width: 0; padding-right: 12px;">
                                        <span class="material-symbols-outlined text-orange" style="flex-shrink: 0;">location_on</span>
                                        <span style="font-size: 14px; font-weight: 500; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ addr }}</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                                        <span class="material-symbols-outlined text-orange" v-if="address === addr" style="font-size: 20px;">check_circle</span>
                                        <button 
                                            type="button" 
                                            class="global-header-action"
                                            style="border: none; background: transparent; cursor: pointer; display: grid; place-items: center; color: var(--muted, #a0a0a0); transition: color 0.2s;"
                                            @click.stop="deleteFromHistory(addr)"
                                            title="Delete address"
                                            @mouseenter="$event.target.style.color = '#d32f2f'"
                                            @mouseleave="$event.target.style.color = 'var(--muted, #a0a0a0)'"
                                        >
                                            <span class="material-symbols-outlined" style="font-size: 20px; pointer-events: none;">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p v-if="errorMessage" style="color: #d32f2f; text-align: center; font-weight: 600; margin-bottom: 16px;">{{ errorMessage }}</p>
                        <p v-if="successMessage" style="color: #2e7d32; text-align: center; font-weight: 600; margin-bottom: 16px;">{{ successMessage }}</p>

                        <button 
                            type="submit" 
                            :disabled="isSaving"
                            style="width: 100%; padding: 16px; border-radius: 12px; background: var(--orange, #f25c05); color: white; font-size: 16px; font-weight: 700; border: none; cursor: pointer; transition: opacity 0.2s;"
                            :style="{ opacity: isSaving ? 0.7 : 1 }"
                        >
                            {{ isSaving ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </div>

      <bottom-navigation active="profile" @navigate="handleNavigation"></bottom-navigation>
    </main>
  `
};
