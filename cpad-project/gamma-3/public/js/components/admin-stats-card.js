export default {
  name: 'AdminStatsCard',

  props: {
    revenue: { type: Number, required: true },
    dineIn: { type: Number, required: true },
    takeaway: { type: Number, required: true },
    delivery: { type: Number, required: true },
    period: { type: String, default: 'today' }
  },

  emits: ['period-change'],

  template: /*HTML*/ `
    <div class="admin-stats-card">
      <div class="stats-card-header">
        <span class="stats-card-title">Total Revenue</span>
        <div class="stats-card-select-wrapper">
          <select 
            class="stats-card-select" 
            :value="period" 
            @change="$emit('period-change', $event.target.value)"
          >
            <option value="today">Today</option>
            <option value="all_time">All Time</option>
          </select>
          <span class="material-symbols-outlined stats-card-select-arrow">expand_more</span>
        </div>
      </div>
      
      <h2 class="stats-card-amount">$ {{ revenue.toFixed(2) }}</h2>
      <hr class="stats-card-divider" />
      
      <div class="stats-card-columns">
        <div class="stats-card-column">
          <span class="material-symbols-outlined stats-card-col-icon">restaurant</span>
          <span class="stats-card-col-label">Dine-In</span>
          <span class="stats-card-col-value">{{ dineIn }}</span>
        </div>
        
        <div class="stats-card-column">
          <span class="material-symbols-outlined stats-card-col-icon">shopping_bag</span>
          <span class="stats-card-col-label">Takeaway</span>
          <span class="stats-card-col-value">{{ takeaway }}</span>
        </div>
        
        <div class="stats-card-column">
          <span class="material-symbols-outlined stats-card-col-icon">delivery_dining</span>
          <span class="stats-card-col-label">Delivery</span>
          <span class="stats-card-col-value">{{ delivery }}</span>
        </div>
      </div>
    </div>
  `
};
