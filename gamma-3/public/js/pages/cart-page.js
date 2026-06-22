import { getCart, updateCartItemQuantity, deleteCartItem, checkoutCart } from '../services/cart-service.js';

export default {
  name: 'CartPage',

  emits: ['navigate', 'logout'],

  data() {
    return {
      cartItems: [],
      loading: true,
      submitting: false,
      errorMessage: '',
      orderType: 'dine_in', // default: dine_in
      paymentMethod: 'cash', // default: cash
      tableNumber: '',
      deliveryAddress: '',
      customerNote: '',
      pickupTime: '',
      profileLoaded: false,
      showPaymentDropdown: false,
      settings: {
        service_fee: 10.0,
        delivery_fee: 5.00,
        packaging_fee_takeaway: 0.50,
        packaging_fee_delivery: 0.50,
      },
    };
  },

  computed: {
    subtotal() {
      return this.cartItems.reduce((sum, item) => sum + (Number(item.unit_price) * item.quantity), 0);
    },

    addonsTotal() {
      return this.cartItems.reduce((sum, item) => {
        const itemAddonsCost = (item.addons || []).reduce((addonSum, addon) => {
          return addonSum + (Number(addon.unit_price) * Number(addon.quantity));
        }, 0);
        return sum + (itemAddonsCost * item.quantity);
      }, 0);
    },

    totalQuantity() {
      return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    },

    computedServiceFee() {
      const rate = (this.settings.service_fee || 0) / 100.0;
      return this.subtotal * rate;
    },

    computedPackagingFee() {
      if (this.orderType === 'takeaway') {
        return this.totalQuantity * (this.settings.packaging_fee_takeaway || 0);
      }
      if (this.orderType === 'delivery') {
        return this.totalQuantity * (this.settings.packaging_fee_delivery || 0);
      }
      return 0.0;
    },

    computedDeliveryFee() {
      if (this.orderType === 'delivery') {
        return this.settings.delivery_fee || 0;
      }
      return 0.0;
    },

    computedTotal() {
      return this.subtotal + this.addonsTotal + this.computedServiceFee + this.computedPackagingFee + this.computedDeliveryFee;
    },

    paymentIcon() {
      if (this.paymentMethod === 'cash') return 'payments';
      if (this.paymentMethod === 'e_wallet') return 'account_balance_wallet';
      return 'credit_card';
    },

    paymentLabel() {
      if (this.paymentMethod === 'cash') return 'Cash';
      if (this.paymentMethod === 'e_wallet') return 'E-Wallet';
      if (this.paymentMethod === 'online_banking') return 'Online Banking';
      return '';
    },

    paymentOptions() {
      return [
        { value: 'cash', label: 'Cash', icon: 'payments' },
        { value: 'e_wallet', label: 'E-Wallet', icon: 'account_balance_wallet' },
        { value: 'online_banking', label: 'Online Banking', icon: 'credit_card' }
      ];
    },

    canCheckout() {
      if (this.loading || this.submitting || this.cartItems.length === 0) {
        return false;
      }
      if (this.orderType === 'dine_in' && !this.tableNumber.trim()) {
        return false;
      }
      if (this.orderType === 'delivery' && !this.deliveryAddress.trim()) {
        return false;
      }
      if (this.orderType === 'takeaway' && !this.pickupTime.trim()) {
        return false;
      }
      return true;
    },
  },

  async mounted() {
    await this.loadCart();
    document.addEventListener('click', this.closePaymentDropdownOutside);
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closePaymentDropdownOutside);
  },

  methods: {
    closePaymentDropdownOutside(e) {
      if (this.$refs.paymentDropdownContainer && !this.$refs.paymentDropdownContainer.contains(e.target)) {
        this.showPaymentDropdown = false;
      }
    },

    selectPaymentMethod(val) {
      this.paymentMethod = val;
      this.showPaymentDropdown = false;
    },
    formatImageUrl(path) {
      if (!path) return '../assets/images/No Menu Image.png';
      if (path.startsWith('data:') || path.startsWith('blob:')) return path;
      return `../${path.split('/').map(encodeURIComponent).join('/')}`;
    },

    formatPrice(val) {
      return `$${Number(val).toFixed(2)}`;
    },

    getItemCustomizations(item) {
      const parts = [];
      if (item.addons && item.addons.length > 0) {
        item.addons.forEach(addon => {
          const addonQty = Number(addon.quantity);
          if (addonQty > 0) {
            const priceStr = Number(addon.unit_price) > 0 ? ` (+$${(addon.unit_price * addonQty).toFixed(2)})` : '';
            const qtyStr = addonQty > 1 ? ` (x${addonQty})` : '';
            parts.push(`+ ${addon.addon_name}${qtyStr}${priceStr}`);
          }
        });
      }
      if (item.special_instructions && item.special_instructions.trim() !== '') {
        parts.push(`Note: "${item.special_instructions}"`);
      }
      return parts.join('\n');
    },

    async loadCart() {
      this.loading = true;
      try {
        const response = await getCart();
        this.cartItems = response.items || [];
        if (response.settings) {
          this.settings = {
            service_fee: Number(response.settings.service_fee ?? 10.0),
            delivery_fee: Number(response.settings.delivery_fee ?? response.settings.delivery_fee_flat ?? 5.00),
            packaging_fee_takeaway: Number(response.settings.packaging_fee_takeaway ?? response.settings.packaging_fee ?? response.settings.packaging_fee_per_item ?? 0.50),
            packaging_fee_delivery: Number(response.settings.packaging_fee_delivery ?? response.settings.packaging_fee ?? response.settings.packaging_fee_per_item ?? 0.50),
          };
        }
        if (response.profile && !this.profileLoaded) {
          if (response.profile.default_address && !this.deliveryAddress) {
            this.deliveryAddress = response.profile.default_address;
          }
          if (response.profile.default_payment_method) {
            this.paymentMethod = response.profile.default_payment_method;
          }
          this.profileLoaded = true;
        }
        localStorage.setItem('cartCount', response.total_quantity ?? 0);
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.loading = false;
      }
    },

    async updateQty(item, delta) {
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        if (!window.confirm(`Remove ${item.item_name} from cart?`)) {
          return;
        }
        try {
          await deleteCartItem(item.cart_item_id);
          await this.loadCart();
        } catch (error) {
          this.errorMessage = error.message;
        }
      } else {
        try {
          await updateCartItemQuantity(item.cart_item_id, newQty);
          await this.loadCart();
        } catch (error) {
          this.errorMessage = error.message;
        }
      }
    },

    async handleCheckout() {
      if (!this.canCheckout) return;

      this.submitting = true;
      this.errorMessage = '';

      let formattedPickupAt = null;
      if (this.orderType === 'takeaway' && this.pickupTime) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        formattedPickupAt = `${yyyy}-${mm}-${dd} ${this.pickupTime}:00`;
      }

      try {
        await checkoutCart(
          this.orderType,
          this.paymentMethod,
          this.orderType === 'dine_in' ? this.tableNumber.trim() : null,
          this.orderType === 'delivery' ? this.deliveryAddress.trim() : null,
          this.customerNote.trim() || null,
          formattedPickupAt
        );
        // Reset local cart count
        localStorage.setItem('cartCount', 0);
        // Redirect to orders page
        this.$emit('navigate', 'orders');
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.submitting = false;
      }
    },
  },

  template: /*HTML*/`
    <main class="cart-page admin-shell" aria-label="Cart Page">
      <app-sidebar active="menu" @navigate="$emit('navigate', $event)" @logout="$emit('logout')"></app-sidebar>

      <div class="admin-main cart-main">
        <app-header title="Your Cart" variant="page" show-back @back="$emit('navigate', 'menu')"></app-header>

        <p v-if="errorMessage" class="details-validation" style="margin: 16px 16px 0;" role="alert">{{ errorMessage }}</p>

        <div v-if="loading" class="cart-container" style="display: block; text-align: center; padding: 40px 0;">
          <p style="color: var(--muted); font-family: 'Inter', sans-serif;">Loading your cart...</p>
        </div>

        <div v-else-if="cartItems.length === 0" class="cart-container" style="display: block;">
          <div class="cart-empty-state">
            <span class="material-symbols-outlined" style="font-size: 48px; color: var(--orange); margin-bottom: 12px;">shopping_cart</span>
            <h2 style="margin: 0 0 8px; color: var(--text); font-family: 'Inter', sans-serif;">Your Cart is Empty</h2>
            <p style="color: var(--muted); margin: 0 0 20px; font-family: 'Inter', sans-serif;">Add some delicious meals from our menu!</p>
            <button class="filter-pill active" type="button" @click="$emit('navigate', 'menu')" style="margin: 0 auto; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
              <span class="material-symbols-outlined" style="font-size: 18px;">arrow_back</span>
              <span>Back to Menu</span>
            </button>
          </div>
        </div>

        <div v-else class="cart-container">
          <!-- Left Section: Cart Items List -->
          <div class="cart-items-section">
            <div class="cart-items-list">
              <div v-for="item in cartItems" :key="item.cart_item_id" class="cart-item-row">
                <img class="cart-item-image" :src="formatImageUrl(item.image_path)" :alt="item.item_name" />
                <div class="cart-item-details">
                  <div class="cart-item-top">
                    <h3 class="cart-item-name">{{ item.item_name }}</h3>
                    <div v-if="getItemCustomizations(item)" class="cart-item-customizations">
                      {{ getItemCustomizations(item) }}
                    </div>
                  </div>
                  <div class="cart-item-bottom">
                    <span class="cart-item-price">{{ formatPrice(item.unit_price) }}</span>
                    <div class="cart-qty-picker">
                      <button class="cart-qty-btn" type="button" aria-label="Decrease quantity" @click="updateQty(item, -1)">
                        <span class="material-symbols-outlined">remove</span>
                      </button>
                      <span class="cart-qty-value">{{ item.quantity }}</span>
                      <button class="cart-qty-btn" type="button" aria-label="Increase quantity" @click="updateQty(item, 1)">
                        <span class="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Section: Form Options & Totals -->
          <div class="cart-form-section">
            <!-- Pickup Method -->
            <label class="cart-section-title" style="font-weight: 500; font-size: 12px; color: #5B4138; text-transform: none; display: block;">Pickup Method</label>
            <div class="cart-segmented-control">
              <button class="cart-segment-btn" :class="{ active: orderType === 'dine_in' }" type="button" @click="orderType = 'dine_in'">Dine In</button>
              <button class="cart-segment-btn" :class="{ active: orderType === 'takeaway' }" type="button" @click="orderType = 'takeaway'">Take Away</button>
              <button class="cart-segment-btn" :class="{ active: orderType === 'delivery' }" type="button" @click="orderType = 'delivery'">Delivery</button>
            </div>

            <!-- Table Number or Address Input or Pickup Time Input -->
            <div v-if="orderType === 'dine_in'" style="position: relative; margin-bottom: 20px;">
              <span class="material-symbols-outlined" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); z-index: 1; pointer-events: none; font-size: 22px; color: var(--muted);">table_restaurant</span>
              <input class="cart-input-field" style="padding-left: 48px;" v-model="tableNumber" type="text" placeholder="Enter Table Number (e.g. A12)" />
            </div>
            <div v-if="orderType === 'takeaway'" style="position: relative; margin-bottom: 20px;">
              <span class="material-symbols-outlined" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); z-index: 1; pointer-events: none; font-size: 22px; color: var(--muted);">schedule</span>
              <input class="cart-input-field" style="padding-left: 48px;" v-model="pickupTime" type="text" placeholder="Enter Estimate Pickup Time (e.g. 6:30 PM)" required />
            </div>
            <div v-if="orderType === 'delivery'" style="position: relative; margin-bottom: 20px;">
              <span class="material-symbols-outlined" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); z-index: 1; pointer-events: none; font-size: 22px; color: var(--muted);">location_on</span>
              <input class="cart-input-field" style="padding-left: 48px;" v-model="deliveryAddress" type="text" placeholder="Enter Delivery Address (e.g. N28)" />
            </div>

            <!-- Customer Note -->
            <label class="cart-section-title" style="font-weight: 500; font-size: 12px; color: #5B4138; text-transform: none; display: block;">Additional Note</label>
            <div style="position: relative; margin-bottom: 20px;">
              <span class="material-symbols-outlined" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); z-index: 1; pointer-events: none; font-size: 22px; color: var(--muted);">edit_note</span>
              <input class="cart-input-field" style="padding-left: 48px;" v-model="customerNote" type="text" placeholder="Add a Note (e.g. Need Tableware)" />
            </div>

            <!-- Payment Method -->
            <label class="cart-section-title" style="font-weight: 500; font-size: 12px; color: #5B4138; text-transform: none; display: block;">Payment Method</label>
            <div class="cart-select-wrapper" style="margin-bottom: 24px; position: relative;" ref="paymentDropdownContainer">
              <button 
                class="cart-select-field" 
                type="button" 
                @click="showPaymentDropdown = !showPaymentDropdown"
                style="display: flex; align-items: center; justify-content: space-between; text-align: left; padding: 12px 16px 12px 48px;"
              >
                <span class="material-symbols-outlined cart-select-icon">{{ paymentIcon }}</span>
                <span>{{ paymentLabel }}</span>
                <span class="material-symbols-outlined" style="color: var(--muted); font-size: 20px; transition: transform 0.2s;" :style="{ transform: showPaymentDropdown ? 'rotate(180deg)' : 'none' }">keyboard_arrow_down</span>
              </button>
              
              <!-- Custom Dropdown Menu -->
              <div 
                v-if="showPaymentDropdown" 
                class="cart-dropdown-menu"
              >
                <button 
                  v-for="opt in paymentOptions" 
                  :key="opt.value" 
                  class="cart-dropdown-item" 
                  :class="{ active: paymentMethod === opt.value }"
                  type="button"
                  @click="selectPaymentMethod(opt.value)"
                >
                  <span class="material-symbols-outlined cart-dropdown-item-icon">{{ opt.icon }}</span>
                  <span class="cart-dropdown-item-text">{{ opt.label }}</span>
                  <span v-if="paymentMethod === opt.value" class="material-symbols-outlined cart-dropdown-item-check">check</span>
                </button>
              </div>
            </div>

            <!-- Summary Totals -->
            <div class="cart-summary-totals">
              <div class="cart-total-row">
                <span>Subtotal</span>
                <span>{{ formatPrice(subtotal + addonsTotal) }}</span>
              </div>
              <div v-if="computedServiceFee > 0" class="cart-total-row">
                <span>Service Fee ({{ settings.service_fee }}%)</span>
                <span>{{ formatPrice(computedServiceFee) }}</span>
              </div>
              <div v-if="computedPackagingFee > 0" class="cart-total-row">
                <span>Packaging Fee ({{ formatPrice(orderType === 'takeaway' ? settings.packaging_fee_takeaway : settings.packaging_fee_delivery) }}/item)</span>
                <span>{{ formatPrice(computedPackagingFee) }}</span>
              </div>
              <div v-if="computedDeliveryFee > 0" class="cart-total-row">
                <span>Delivery Fee ({{ formatPrice(settings.delivery_fee) }})</span>
                <span>{{ formatPrice(computedDeliveryFee) }}</span>
              </div>
              <div class="cart-total-row grand-total">
                <span>Total</span>
                <span class="price-val">{{ formatPrice(computedTotal) }}</span>
              </div>
            </div>

            <!-- Checkout Button -->
            <button class="cart-checkout-btn" type="button" :disabled="!canCheckout" @click="handleCheckout">
              {{ submitting ? 'Processing...' : 'Checkout' }}
            </button>
          </div>
        </div>
      </div>

      <bottom-navigation active="menu" @navigate="$emit('navigate', $event)"></bottom-navigation>
    </main>
  `,
};
