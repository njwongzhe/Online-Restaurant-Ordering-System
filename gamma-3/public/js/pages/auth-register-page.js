import { register } from '../services/auth-service.js';

export default {
    name: 'AuthRegisterPage',
    
    data() {
        return {
            displayName: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            loading: false,
            errorMessage: '',
            successMessage: '',
        };
    },

    methods: {
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
                            <input class="input-box" id="phoneNumber" v-model="phoneNumber" type="text" placeholder="0123456789" />
                        </div>
                        <div class="input-field">
                            <label class="input-box-label" for="password">Password</label>
                            <input class="input-box" id="password" v-model="password" type="password" placeholder="********" />
                        </div>
                        <div class="input-field">
                            <label class="input-box-label" for="confirmPassword">Confirm Password</label>
                            <input class="input-box" id="confirmPassword" v-model="confirmPassword" type="password" placeholder="********" />
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
