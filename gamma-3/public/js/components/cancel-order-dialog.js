export default {
  name: 'CancelOrderDialog',

  props: {
    order: { type: Object, required: true },
    submitting: { type: Boolean, default: false },
  },

  emits: ['close', 'confirm'],

  data() {
    return { reason: '' };
  },

  template: /*HTML*/ `
    <teleport to="body">
      <div class="cancel-dialog-backdrop" @click.self="$emit('close')" @keydown.esc="$emit('close')">
        <section class="cancel-dialog" role="dialog" aria-modal="true" aria-labelledby="cancel-dialog-title">
          <div class="cancel-dialog-heading">
            <div class="cancel-dialog-icon">
              <span class="material-symbols-outlined">cancel</span>
            </div>
            <div>
              <span>Order cancellation</span>
              <h2 id="cancel-dialog-title">Cancel order {{ order.id }}?</h2>
            </div>
          </div>
          <p>The order will be marked as completed and moved to Order History.</p>

          <label class="cancel-dialog-field">
            <span>Cancellation reason <small>Optional</small></span>
            <textarea
              v-model="reason"
              maxlength="500"
              rows="4"
              placeholder="For example: Item unavailable"
              autofocus
            ></textarea>
            <small>{{ reason.length }}/500</small>
          </label>

          <div class="cancel-dialog-actions">
            <button type="button" :disabled="submitting" @click="$emit('close')">Keep Order</button>
            <button class="confirm" type="button" :disabled="submitting" @click="$emit('confirm', reason.trim())">
              {{ submitting ? 'Cancelling...' : 'Cancel Order' }}
            </button>
          </div>
        </section>
      </div>
    </teleport>
  `,
};
