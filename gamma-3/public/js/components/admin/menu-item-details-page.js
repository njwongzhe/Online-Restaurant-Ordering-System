import AdminSidebar from './sidebar.js';

const DEFAULT_IMAGE = '../assets/images/No Menu Image.png';
const DEFAULT_ADDONS = [
  { name: 'Grilled Chicken Breast', price: 4.50 },
  { name: 'Smoked Atlantic Salmon', price: 6.00 },
  { name: 'Organic Tempeh', price: 3.50 },
];

function numericPrice(value) {
  return String(value ?? '').replace(/[^0-9.]/g, '');
}

export default {
  name: 'MenuItemDetailsPage',
  components: { AdminSidebar },

  props: {
    item: { type: Object, default: () => ({}) },
    categoryName: { type: String, default: '' },
  },

  emits: ['back', 'save', 'delete', 'navigate'],

  data() {
    const isEditing = Boolean(this.item?.id);
    const sourceAddons = Array.isArray(this.item?.addons)
      ? this.item.addons
      : (isEditing ? DEFAULT_ADDONS : []);

    return {
      form: {
        name: this.item?.name || '',
        basePrice: numericPrice(this.item?.price),
        description: this.item?.description || '',
        image: this.item?.image || DEFAULT_IMAGE,
        isAvailable: this.item?.isAvailable ?? true,
      },
      addons: sourceAddons.map((addon, index) => ({
        id: addon.id || `addon-${index + 1}`,
        name: addon.name,
        price: Number(addon.price),
      })),
      editingAddonId: null,
      addonDraft: { name: '', price: '' },
      nextAddonNumber: sourceAddons.length + 1,
      validationMessage: '',
    };
  },

  computed: {
    isEditing() {
      return Boolean(this.item?.id);
    },

    pageTitle() {
      return this.isEditing ? 'Edit Item Details' : 'Add Item Details';
    },
  },

  methods: {
    openImagePicker() {
      this.$refs.imageInput?.click();
    },

    handleImageUpload(event) {
      const [file] = event.target.files;
      if (!file) return;

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.form.image = reader.result;
      });
      reader.readAsDataURL(file);
    },

    addAddon() {
      const addon = {
        id: `addon-${this.nextAddonNumber++}`,
        name: '',
        price: 0,
        isNew: true,
      };
      this.addons.push(addon);
      this.editAddon(addon);
    },

    editAddon(addon) {
      this.editingAddonId = addon.id;
      this.addonDraft = {
        name: addon.name,
        price: Number(addon.price).toFixed(2),
      };
      this.$nextTick(() => {
        const input = document.querySelector(`[data-addon-input="${addon.id}"]`);
        input?.focus();
        input?.select();
      });
    },

    saveAddon(addon) {
      const name = this.addonDraft.name.trim();
      const price = Number(this.addonDraft.price);
      if (!name || !String(this.addonDraft.price).trim() || Number.isNaN(price) || price < 0) return;

      addon.name = name;
      addon.price = price;
      delete addon.isNew;
      this.editingAddonId = null;
    },

    cancelAddon(addon) {
      if (addon.isNew) this.removeAddon(addon);
      this.editingAddonId = null;
    },

    removeAddon(addon) {
      this.addons = this.addons.filter((entry) => entry.id !== addon.id);
    },

    handleNavigation(destination) {
      if (destination === 'menu') this.$emit('back');
      else this.$emit('navigate', destination);
    },

    submitItem() {
      const price = Number(this.form.basePrice);
      if (!this.form.name.trim() || !String(this.form.basePrice).trim() || Number.isNaN(price) || price < 0 || !this.form.description.trim()) {
        this.validationMessage = 'Enter an item name, valid base price, and description.';
        return;
      }

      this.validationMessage = '';
      this.$emit('save', {
        ...this.item,
        name: this.form.name.trim(),
        description: this.form.description.trim(),
        price: `$${price.toFixed(2)}`,
        image: this.form.image,
        isAvailable: this.form.isAvailable,
        addons: this.addons.map(({ id, name, price: addonPrice }) => ({ id, name, price: addonPrice })),
      });
    },
  },

  template: `
    <main class="item-details-page admin-shell" :aria-label="pageTitle">
      <admin-sidebar active="menu" @navigate="handleNavigation"></admin-sidebar>

      <div class="item-details-main">
        <app-header :title="pageTitle" variant="page" show-back @back="$emit('back')"></app-header>

        <div class="details-page-container">
          <div class="details-workspace">
            <section class="details-photo" :aria-label="(form.name || 'Menu item') + ' photo'">
              <img :src="form.image" :alt="form.name || 'Menu item preview'" />
              <input ref="imageInput" class="details-file-input" type="file" accept="image/*" @change="handleImageUpload" />
              <button class="image-upload-button" type="button" @click="openImagePicker">
                <span class="material-symbols-outlined">add_a_photo</span>
                <span>Upload photo</span>
              </button>
            </section>

            <form class="details-card" aria-label="Menu item details form" @submit.prevent="submitItem">
              <div class="details-field">
                <label for="item-name">Item Name</label>
                <input id="item-name" v-model="form.name" type="text" placeholder="Enter item name" />
              </div>

              <div class="details-field">
                <label for="base-price">Base Price ($)</label>
                <input id="base-price" v-model="form.basePrice" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" />
              </div>

              <div class="details-field description-field">
                <label for="item-description">Description</label>
                <textarea id="item-description" v-model="form.description" rows="5" placeholder="Describe this menu item"></textarea>
              </div>

              <hr class="details-divider" />

              <div class="addons-heading">
                <div>
                  <h2>Customize Your Item</h2>
                  <p>Edit optional add-ons and their additional price.</p>
                </div>
                <button class="addon-add-button" type="button" aria-label="Add customization" @click="addAddon">
                  <span class="material-symbols-outlined">add_circle</span>
                </button>
              </div>

              <div class="details-addons">
                <div v-for="addon in addons" :key="addon.id" class="details-addon-row" :class="{ editing: editingAddonId === addon.id }">
                  <template v-if="editingAddonId === addon.id">
                    <input v-model="addonDraft.name" class="addon-name-input" :data-addon-input="addon.id" type="text" placeholder="Add-on name" />
                    <div class="addon-price-input-wrap">
                      <span>+$</span>
                      <input v-model="addonDraft.price" type="number" min="0" step="0.01" inputmode="decimal" />
                    </div>
                    <div class="addon-edit-actions">
                      <button type="button" aria-label="Save add-on" @click="saveAddon(addon)"><span class="material-symbols-outlined">check</span></button>
                      <button type="button" aria-label="Cancel add-on editing" @click="cancelAddon(addon)"><span class="material-symbols-outlined">close</span></button>
                    </div>
                  </template>
                  <template v-else>
                    <button class="addon-edit-button" type="button" :aria-label="'Edit ' + addon.name" @click="editAddon(addon)">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <span class="addon-name">{{ addon.name }}</span>
                    <strong class="addon-price">+&#36;{{ Number(addon.price).toFixed(2) }}</strong>
                    <button class="addon-remove-button" type="button" :aria-label="'Remove ' + addon.name" @click="removeAddon(addon)">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </template>
                </div>
                <p v-if="addons.length === 0" class="addons-empty">No add-ons yet. Use the plus button to create one.</p>
              </div>

              <p v-if="validationMessage" class="details-validation" role="alert">{{ validationMessage }}</p>

              <div class="details-actions">
                <button v-if="isEditing" class="details-delete-button" type="button" @click="$emit('delete', item)">
                  <span class="material-symbols-outlined">delete</span>
                  <span>Delete Item</span>
                </button>
                <button class="details-save-button" type="submit">{{ isEditing ? 'Save Changes' : 'Add Item' }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <bottom-navigation active="menu" @navigate="handleNavigation"></bottom-navigation>
    </main>
  `,
};
