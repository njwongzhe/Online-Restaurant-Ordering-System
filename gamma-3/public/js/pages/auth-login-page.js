import { login } from '../services/auth-service.js';

export default {
    name: 'AuthLoginPage',
    
    data() {
        return {
            phoneNumber: '',
            password: '',
            loading: false,
            errorMessage: '',
        };
    },

    methods: {
        async handleLogin() {   
            this.errorMessage = '';

            if (!this.phoneNumber || !this.password) {
                this.errorMessage = 'Please fill in all fields.';
                return;
            }

            if (this.password.length < 8) {
                this.errorMessage = 'Password must be at least 8 characters long.';
                return;
            }

            this.loading = true;

            try {
                const response = await login(this.phoneNumber, this.password);
                localStorage.setItem('jwtToken', response.token);
                localStorage.setItem('displayName', response.user.displayName);
                localStorage.setItem('role', response.user.role);
                if (response.user.role === 'admin') {
                    localStorage.setItem('position', response.user.position || '');
                } else {
                    localStorage.removeItem('position');
                }
                this.$emit('navigate', 'menu');
            } catch (error) {
                this.errorMessage = error.message;
            } finally {
                this.loading = false;
            }
        }
    },

    template: /*HTML*/`
        <div class="login-page-wrapper">
            <main class="login-layout">
                <div class="login-logo-container">
                    <span id="login-logo" class="material-symbols-outlined login-logo-icon">restaurant</span>
                    <p class="login-logo-title">Lanita Restaurant</p>
                </div>

                <div class="login-header">
                    <p class="login-header-title">Welcome Back</p>
                    <p class="login-header-subtitle">Log in to your account to continue</p>
                </div>

                <form class="login-form" @submit.prevent="handleLogin">
                    <div class="input-field-container">
                        <div class="input-field">
                            <label class="input-box-label" for="phoneNumber">Phone Number</label>
                            <input class="input-box" id="phoneNumber" v-model="phoneNumber" type="text" placeholder="0123456789" />
                        </div>
                        <div class="input-field">
                            <label class="input-box-label" for="password">Password</label>
                            <input class="input-box" id="password" v-model="password" type="password" placeholder="********" />
                        </div>
                    </div>
                    
                    <p v-if="errorMessage" class="login-error-message" role="alert">{{ errorMessage }}</p>

                    <button id="login-button" type="submit" :disabled="loading">
                        {{ loading ? 'Logging In...' : 'Log In' }}
                    </button>
                    <div class="create-account-container">
                        <div id="register-account-divider">No account?</div>
                        <button id="create-account-button" type="button" @click="$emit('navigate', 'register')">Create Account</button>
                    </div>
                </form>

                <div class="copyright">© 2026 Gamma Group</div>
            </main>
        </div>
    `
}