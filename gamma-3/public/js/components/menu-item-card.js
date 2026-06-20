export default {
  name: 'MenuItemCard',

  props: {
    item: { type: Object, required: true },
    categoryAvailable: { type: Boolean, default: true },
  },

  emits: ['toggle', 'edit'],

  template: `
    <article class="card" :class="{ unavailable: !categoryAvailable || !item.isAvailable }">
      <img class="card-image" :src="item.image" :alt="item.name || 'New menu item'" />
      <div class="card-content">
        <h3 class="item-name">{{ item.name }}</h3>
        <p class="item-desc">{{ item.description }}</p>
      </div>
      <strong class="price">{{ item.price }}</strong>

      <div class="item-actions">
        <button
          class="item-toggle"
          :class="{ off: !item.isAvailable }"
          type="button"
          title="Toggle availability"
          :aria-pressed="item.isAvailable"
          @click="$emit('toggle')"
        ></button>
        <button class="edit-item" type="button" :title="'Edit ' + (item.name || 'item')" @click="$emit('edit')">
          <span class="material-symbols-outlined">edit</span>
        </button>
      </div>
    </article>
  `,
};
