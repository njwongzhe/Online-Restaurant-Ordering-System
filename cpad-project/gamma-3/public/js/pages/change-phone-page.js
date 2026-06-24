export default {
  name: 'ChangePhonePage',

  emits: ['navigate', 'back'],

  data() {
    return {
      isLoading: false,
      isSaving: false,
      newPhone: '',
      password: '',
      successMessage: '',
      errorMessage: ''
    };
  },

  mounted() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      this.$emit('navigate', 'login');
    }
  },

  methods: {
    handleNavigation(destination) {
      this.$emit('navigate', destination);
    },
    
    goBack() {
      this.$emit('navigate', 'profile');
    },

    async savePhoneNumber() {
      this.isSaving = true;
      this.errorMessage = '';
      this.successMessage = '';

      const token = localStorage.getItem('jwtToken');

      try {
        const response = await fetch('/gamma-3/api/user/phone-number', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
          },
          body: JSON.stringify({ 
            new_phone_number: this.newPhone,
            password: this.password
          })
        });

        if (response.ok) {
          this.successMessage = 'Phone number updated successfully!';
          
          // Update the locally cached phone number
          localStorage.setItem('phoneNumber', this.newPhone);
          
          setTimeout(() => this.goBack(), 1500);
        } else {
          const result = await response.json();
          this.errorMessage = result.error || 'Failed to update phone number.';
        }
      } catch (err) {
        this.errorMessage = 'A network error occurred.';
      } finally {
        this.isSaving = false;
      }
    }
  },

  template: /*HTML*/ `
    <main class="profile-page change-phone-page admin-shell" aria-label="Change Phone Number">
      
      <app-sidebar active="profile" @navigate="handleNavigation"></app-sidebar>

      <div class="admin-main profile-main">
        
        <app-header title="Change Phone Number" variant="page" show-back @back="goBack"></app-header>

        <div class="profile-content">

            <div v-if="isLoading" style="text-align: center; padding: 40px; color: var(--muted);">
                Loading...
            </div>

            <div v-else class="profile-layout">
                <div class="profile-settings">
                    <form @submit.prevent="savePhoneNumber" class="menu-section">
                        <p style="color: var(--muted, #888); margin-bottom: 24px; font-size: 15px; font-weight: 500;">Update the phone number associated with your account.</p>
                        
                        <div class="input-field" style="margin-bottom: 20px;">
                            <label class="input-box-label" for="new-phone-input">New Phone Number</label>
                            <input 
                                id="new-phone-input"
                                class="input-box" 
                                v-model="newPhone" 
                                type="text"
                                placeholder="E.g., 0123456789" 
                                style="width: 100%; padding: 16px; border-radius: 12px; border: 1px solid var(--line, #e0e0e0); font-family: inherit; font-size: 15px;"
                            />
                        </div>

                        <div class="input-field" style="margin-bottom: 24px;">
                            <label class="input-box-label" for="phone-password-input">Verification Password</label>
                            <input 
                                id="phone-password-input"
                                class="input-box" 
                                v-model="password" 
                                type="password"
                                placeholder="********" 
                                style="width: 100%; padding: 16px; border-radius: 12px; border: 1px solid var(--line, #e0e0e0); font-family: inherit; font-size: 15px;"
                            />
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
