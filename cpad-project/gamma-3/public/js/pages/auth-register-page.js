import { register } from '../services/auth-service.js';

export default {
    name: 'AuthRegisterPage',
    
    data() {
        return {
            displayName: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            showPassword: false,
            showConfirmPassword: false,
            loading: false,
            errorMessage: '',
            successMessage: '',
        };
    },

    methods: {
        handlePhoneInput(event) {
            const cleaned = event.target.value.replace(/\D/g, '');
            this.phoneNumber = cleaned;
            event.target.value = cleaned;
        },
        async handleRegister() {   
            this.errorMessage = '';
            this.successMessage = '';

            if (!this.displayName || !this.phoneNumber || !this.password || !this.confirmPassword) {
                this.errorMessage = 'Please fill in all fields.';
                return;
            }

            if (this.password.length < 8) {
                this.errorMessage = 'Password must be at least 8 characters long.';
                return;
            }

            if (this.password !== this.confirmPassword) {
                this.errorMessage = 'Passwords do not match.';
                return;
            }

            this.loading = true;

            try {
                await register(this.phoneNumber, this.displayName, this.password, this.confirmPassword);
                this.successMessage = 'Account created successfully! Redirecting to login...';
                
                // Clear fields
                this.displayName = '';
                this.phoneNumber = '';
                this.password = '';
                this.confirmPassword = '';

                setTimeout(() => {
                    this.$emit('navigate', 'login');
                }, 2000);
            } catch (error) {
                this.errorMessage = error.message;
            } finally {
                this.loading = false;
            }
        }
    },

    template: /*HTML*/`
        <div class="register-page-wrapper">
            <main class="register-layout">
                <div class="register-logo-container">
                    <img id="register-logo" src="../assets/logo.svg" alt="Lanita Restaurant Logo" />
                    <p class="register-logo-title">Lanita Restaurant</p>
                </div>

                <div class="register-header">
                    <p class="register-header-title">Create Account</p>
                    <p class="register-header-subtitle">Register a new account to continue</p>
                </div>

                <form class="register-form" @submit.prevent="handleRegister">
                    <div class="input-field-container">
                        <div class="input-field">
                            <label class="input-box-label" for="displayName">Display Name</label>
                            <input class="input-box" id="displayName" v-model="displayName" type="text" placeholder="Aina Rahman" />
                        </div>
                        <div class="input-field">
                            <label class="input-box-label" for="phoneNumber">Phone Number</label>
                            <input class="input-box" id="phoneNumber" :value="phoneNumber" type="tel" @input="handlePhoneInput" placeholder="0123456789" />
                        </div>
                        <div class="input-field">
                            <label class="input-box-label" for="password">Password</label>
                            <div class="password-input-container">
                                <input class="input-box" id="password" v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="********" />
                                <button type="button" class="password-toggle-btn" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'">
                                    <span class="material-symbols-outlined">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
                                </button>
                            </div>
                        </div>
                        <div class="input-field">
                            <label class="input-box-label" for="confirmPassword">Confirm Password</label>
                            <div class="password-input-container">
                                <input class="input-box" id="confirmPassword" v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="********" />
                                <button type="button" class="password-toggle-btn" @click="showConfirmPassword = !showConfirmPassword" :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'">
                                    <span class="material-symbols-outlined">{{ showConfirmPassword ? 'visibility' : 'visibility_off' }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <p v-if="errorMessage" class="register-error-message" role="alert">{{ errorMessage }}</p>
                    <p v-if="successMessage" class="register-success-message" role="alert">{{ successMessage }}</p>

                    <button id="register-button" type="submit" :disabled="loading">
                        {{ loading ? 'Creating Account...' : 'Create Account' }}
                    </button>
                    <div class="create-account-container">
                        <div id="register-account-divider">Already have an account?</div>
                        <button id="create-account-button" type="button" @click="$emit('navigate', 'login')">Log In</button>
                    </div>
                </form>

                <div class="copyright">© 2026 Gamma Group</div>
            </main>
        </div>
    `
}
