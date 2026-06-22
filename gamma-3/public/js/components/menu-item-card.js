export default {
  name: 'MenuItemCard',

  props: {
    item: { type: Object, required: true },
    categoryAvailable: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
  },

  emits: ['toggle', 'edit'],

  template: /*HTML*/`
    <article class="card" :class="{ unavailable: !categoryAvailable || !item.isAvailable }">
      <img class="card-image" :src="item.image" :alt="item.name || 'New menu item'" />
      <div class="card-content">
        <h3 class="item-name">{{ item.name }}</h3>
        <p class="item-desc">{{ item.description }}</p>
      </div>
      <strong class="price">{{ item.price }}</strong>

      <div v-if="isAdmin" class="item-actions">
        <button
          class="item-toggle"
          :class="{ off: !item.isAvailable }"
          type="button"
          title="Toggle availability"
          :aria-pressed="item.isAvailable"
          @click="$emit('toggle')"
        ></button>
        <button class="edit-item" type="button" :title="'Edit ' + (item.name || 'item')" @click="$emit('edit')">
          <span id="order-add-button-icon" class="material-symbols-outlined">edit</span>
        </button>
      </div>
      <div v-else-if="categoryAvailable && item.isAvailable" class="item-actions">
        <button class="edit-item" type="button" :title="'Order ' + (item.name || 'item')" @click="$emit('edit')">
          <span id="order-add-button-icon" class="material-symbols-outlined">add</span>
        </button>
      </div>
    </article>
  `,
};
