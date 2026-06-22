export default {
  name: 'OrderTimeline',

  props: {
    steps: { type: Array, required: true },
  },

  template: /*html*/ `
    <section class="order-detail-card order-timeline-card" aria-label="Order progress">
      <div v-for="(step, index) in steps" :key="step.state" class="order-timeline-row" :class="{ pending: step.pending }">
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
