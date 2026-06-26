export default {
  name: 'AdminStatsCard',

  props: {
    revenue: { type: Number, required: true },
    dineIn: { type: Number, required: true },
    takeaway: { type: Number, required: true },
    delivery: { type: Number, required: true },
    period: { type: String, default: 'today' },
    loading: { type: Boolean, default: false }
  },

  emits: ['period-change'],

  data() {
    return {
      showDropdown: false
    };
  },

  computed: {
    periodLabel() {
      if (this.period === 'today') return 'Today';
      if (this.period === 'all_time') return 'All Time';
      return '';
    },
    periodOptions() {
      return [
        { value: 'today', label: 'Today' },
        { value: 'all_time', label: 'All Time' }
      ];
    }
  },

  mounted() {
    document.addEventListener('click', this.closeDropdownOutside);
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeDropdownOutside);
  },

  methods: {
    closeDropdownOutside(e) {
      if (this.$refs.dropdownContainer && !this.$refs.dropdownContainer.contains(e.target)) {
        this.showDropdown = false;
      }
    },
    selectPeriod(value) {
      this.$emit('period-change', value);
      this.showDropdown = false;
    }
  },

  template: /*HTML*/ `
    <div class="admin-stats-card">
      <div class="stats-card-header">
        <span class="stats-card-title">Total Revenue</span>
        <div class="stats-card-select-wrapper" ref="dropdownContainer">
          <button 
            type="button"
            class="stats-card-select" 
            @click="showDropdown = !showDropdown"
            :disabled="loading"
            style="display: flex; align-items: center; justify-content: space-between; text-align: left;"
          >
            <span>{{ periodLabel }}</span>
          </button>
          <span class="material-symbols-outlined stats-card-select-arrow" :style="{ transform: showDropdown ? 'rotate(180deg)' : 'none' }">expand_more</span>
          
          <!-- Custom Dropdown Menu -->
          <div 
            v-if="showDropdown && !loading" 
            class="stats-card-dropdown-menu"
          >
            <button 
              v-for="opt in periodOptions" 
              :key="opt.value" 
              class="stats-card-dropdown-item" 
              :class="{ active: period === opt.value }"
              type="button"
              @click="selectPeriod(opt.value)"
            >
              <span>{{ opt.label }}</span>
              <span v-if="period === opt.value" class="material-symbols-outlined stats-card-dropdown-item-check">check</span>
            </button>
          </div>
        </div>
      </div>
      
      <h2 class="stats-card-amount">
        <template v-if="loading">Loading...</template>
        <template v-else>RM {{ revenue.toFixed(2) }}</template>
      </h2>
      <hr class="stats-card-divider" />
      
      <div class="stats-card-columns">
        <div class="stats-card-column">
          <span class="material-symbols-outlined stats-card-col-icon">restaurant</span>
          <span class="stats-card-col-label">Dine-In</span>
          <span class="stats-card-col-value">
            <template v-if="loading">Loading...</template>
            <template v-else>{{ dineIn }}</template>
          </span>
        </div>
        
        <div class="stats-card-column">
          <span class="material-symbols-outlined stats-card-col-icon">shopping_bag</span>
          <span class="stats-card-col-label">Takeaway</span>
          <span class="stats-card-col-value">
            <template v-if="loading">Loading...</template>
            <template v-else>{{ takeaway }}</template>
          </span>
        </div>
        
        <div class="stats-card-column">
          <span class="material-symbols-outlined stats-card-col-icon">delivery_dining</span>
          <span class="stats-card-col-label">Delivery</span>
          <span class="stats-card-col-value">
            <template v-if="loading">Loading...</template>
            <template v-else>{{ delivery }}</template>
          </span>
        </div>
      </div>
    </div>
  `
};
