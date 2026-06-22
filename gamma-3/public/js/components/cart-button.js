export default {
  name: 'CartButton',

  props: {
    count: {
      type: Number,
      default: 0,
    },
  },

  emits: ['click'],

  template: /*HTML*/`
    <button
      class="fixed-cart-btn"
      type="button"
      aria-label="View Cart"
      @click="$emit('click')"
    >
      <span class="material-symbols-outlined">shopping_cart</span>
      <span v-if="count > 0" class="cart-badge">{{ count }}</span>
    </button>
  `,
};
