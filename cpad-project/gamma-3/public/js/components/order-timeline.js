export default {
  name: 'OrderTimeline',

  props: {
    steps: { type: Array, required: true },
    activeIndex: { type: Number, default: 0 },
    interactive: { type: Boolean, default: false },
  },

  emits: ['select-state'],

  template: /*HTML*/ `
    <section class="order-detail-card order-timeline-card" aria-label="Order progress">
      <div 
        v-for="(step, index) in steps" 
        :key="step.state" 
        class="order-timeline-row" 
        :class="{ pending: step.pending, active: index === activeIndex, completed: !step.pending && index < activeIndex, interactive: interactive }"
        @click="interactive && $emit('select-state', step.state)"
      >
        <div class="order-step-icon" :class="{ circle: index === 0 }">
          <span class="material-symbols-outlined">{{ step.icon }}</span>
        </div>
        <div>
          <h2>{{ step.title }}</h2>
          <p>{{ step.subtitle }}</p>
        </div>
      </div>
    </section>
  `,
};
