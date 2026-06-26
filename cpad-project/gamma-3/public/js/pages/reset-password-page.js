export default {
  name: 'ResetPasswordPage',

  emits: ['navigate', 'back', 'logout'],

  data() {
    return {
      isLoading: false,
      isSaving: false,
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
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

    async savePassword() {
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
        this.errorMessage = 'All fields are required.';
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = 'New passwords do not match.';
        return;
      }

      if (this.newPassword.length < 8) {
        this.errorMessage = 'New password must be at least 8 characters long.';
        return;
      }

      this.isSaving = true;
      const token = localStorage.getItem('jwtToken');

      try {
        const response = await fetch('../api/user/password', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
          },
          body: JSON.stringify({ 
            old_password: this.oldPassword,
            new_password: this.newPassword
          })
        });

        if (response.ok) {
          this.successMessage = 'Password reset successfully!';
          setTimeout(() => this.goBack(), 1500);
        } else {
          const result = await response.json();
          this.errorMessage = result.error || 'Failed to reset password.';
        }
      } catch (err) {
        this.errorMessage = 'A network error occurred.';
      } finally {
        this.isSaving = false;
      }
    }
  },

  template: /*HTML*/ `
    <main class="profile-page reset-password-page admin-shell" aria-label="Reset Password">
      
      <app-sidebar active="profile" @navigate="handleNavigation" @logout="$emit('logout')"></app-sidebar>

      <div class="admin-main profile-main">
        
        <app-header title="Reset Password" variant="page" show-back @back="goBack"></app-header>

        <div class="profile-content">

            <div v-if="isLoading" style="text-align: center; padding: 40px; color: var(--muted);">
                Loading...
            </div>

            <div v-else class="profile-layout">
                <div class="profile-settings">
                    <form @submit.prevent="savePassword" class="menu-section">
                        <p style="color: var(--muted, #888); margin-bottom: 24px; font-size: 15px; font-weight: 500;">Change your password to secure your account.</p>

                        <div class="input-field" style="margin-bottom: 20px;">
                            <label class="input-box-label" for="old-password-input">Old Password</label>
                            <div class="password-input-container">
                                <input 
                                    id="old-password-input"
                                    class="input-box" 
                                    v-model="oldPassword" 
                                    :type="showOldPassword ? 'text' : 'password'"
                                    placeholder="********" 
                                    style="width: 100%; padding: 16px; border-radius: 12px; border: 1px solid var(--line, #e0e0e0); font-family: inherit; font-size: 15px; padding-right: 48px;"
                                />
                                <button type="button" class="password-toggle-btn" @click="showOldPassword = !showOldPassword" style="top: 50%; transform: translateY(-50%); right: 10px;" :aria-label="showOldPassword ? 'Hide password' : 'Show password'">
                                    <span class="material-symbols-outlined">{{ showOldPassword ? 'visibility' : 'visibility_off' }}</span>
                                </button>
                            </div>
                        </div>

                        <div class="input-field" style="margin-bottom: 20px;">
                            <label class="input-box-label" for="new-password-input">New Password</label>
                            <div class="password-input-container">
                                <input 
                                    id="new-password-input"
                                    class="input-box" 
                                    v-model="newPassword" 
                                    :type="showNewPassword ? 'text' : 'password'"
                                    placeholder="********" 
                                    style="width: 100%; padding: 16px; border-radius: 12px; border: 1px solid var(--line, #e0e0e0); font-family: inherit; font-size: 15px; padding-right: 48px;"
                                />
                                <button type="button" class="password-toggle-btn" @click="showNewPassword = !showNewPassword" style="top: 50%; transform: translateY(-50%); right: 10px;" :aria-label="showNewPassword ? 'Hide password' : 'Show password'">
                                    <span class="material-symbols-outlined">{{ showNewPassword ? 'visibility' : 'visibility_off' }}</span>
                                </button>
                            </div>
                        </div>

                        <div class="input-field" style="margin-bottom: 24px;">
                            <label class="input-box-label" for="confirm-password-input">Confirm New Password</label>
                            <div class="password-input-container">
                                <input 
                                    id="confirm-password-input"
                                    class="input-box" 
                                    v-model="confirmPassword" 
                                    :type="showConfirmPassword ? 'text' : 'password'"
                                    placeholder="********" 
                                    style="width: 100%; padding: 16px; border-radius: 12px; border: 1px solid var(--line, #e0e0e0); font-family: inherit; font-size: 15px; padding-right: 48px;"
                                />
                                <button type="button" class="password-toggle-btn" @click="showConfirmPassword = !showConfirmPassword" style="top: 50%; transform: translateY(-50%); right: 10px;" :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'">
                                    <span class="material-symbols-outlined">{{ showConfirmPassword ? 'visibility' : 'visibility_off' }}</span>
                                </button>
                            </div>
                        </div>

                        <p v-if="errorMessage" style="color: #d32f2f; text-align: center; font-weight: 600; margin-top: 16px; margin-bottom: 16px;">{{ errorMessage }}</p>
                        <p v-if="successMessage" style="color: #2e7d32; text-align: center; font-weight: 600; margin-top: 16px; margin-bottom: 16px;">{{ successMessage }}</p>

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
