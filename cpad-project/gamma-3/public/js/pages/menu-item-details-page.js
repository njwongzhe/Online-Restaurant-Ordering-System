const DEFAULT_IMAGE = '../assets/images/No Menu Image.png';

function numericPrice(value) {
  return String(value ?? '').replace(/[^0-9.]/g, '');
}

export default {
  name: 'MenuItemDetailsPage',
  props: {
    item: { type: Object, default: () => ({}) },
    categoryName: { type: String, default: '' },
    saving: { type: Boolean, default: false },
    serverError: { type: String, default: '' },
  },

  emits: ['back', 'save', 'delete', 'navigate', 'logout'],

  data() {
    const sourceAddons = Array.isArray(this.item?.addons)
      ? this.item.addons
      : [];

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
        quantity: 0,
      })),
      specialInstructions: '',
      editingAddonId: null,
      addonDraft: { name: '', price: '' },
      nextAddonNumber: sourceAddons.length + 1,
      validationMessage: '',
      imageFile: null,
    };
  },

  computed: {
    isAdmin() {
      const role = localStorage.getItem('role') || 'customer';
      return role === 'admin';
    },

    isEditing() {
      return Boolean(this.item?.id);
    },

    pageTitle() {
      if (!this.isAdmin) return 'Item Details';
      return this.isEditing ? 'Edit Item Details' : 'Add Item Details';
    },

    canSubmit() {
      if (!this.isAdmin) return true;
      const price = Number(this.form.basePrice);
      return !this.saving && this.form.name.trim() !== '' && String(this.form.basePrice).trim() !== '' && Number.isFinite(price) && price >= 0;
    },
  },

  methods: {
    openImagePicker() {
      this.$refs.imageInput?.click();
    },

    handleImageUpload(event) {
      const [file] = event.target.files;
      if (!file) return;

      this.imageFile = file;

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
      if (!this.isAdmin) {
        this.$emit('save', {
          name: this.item.name,
          menuItemId: this.item.id,
          quantity: 1,
          specialInstructions: this.specialInstructions,
          addons: this.addons
            .filter(a => a.quantity > 0)
            .map(a => ({ addonId: Number(a.id), quantity: a.quantity }))
        });
        return;
      }

      const price = Number(this.form.basePrice);
      if (!this.form.name.trim() || !String(this.form.basePrice).trim() || Number.isNaN(price) || price < 0) {
        this.validationMessage = 'Enter an item name and a non-negative base price.';
        return;
      }

      if (this.editingAddonId) {
        this.validationMessage = 'Save or cancel the add-on currently being edited.';
        return;
      }
      const addonNames = new Set();
      for (const addon of this.addons) {
        const name = addon.name.trim().toLowerCase();
        if (!name || !Number.isFinite(Number(addon.price)) || Number(addon.price) < 0 || addonNames.has(name)) {
          this.validationMessage = 'Each add-on needs a unique name and a non-negative price.';
          return;
        }
        addonNames.add(name);
      }

      this.validationMessage = '';
      this.$emit('save', {
        ...this.item,
        name: this.form.name.trim(),
        description: this.form.description.trim(),
        price: price.toFixed(2),
        image: this.form.image,
        imageFile: this.imageFile,
        isAvailable: this.form.isAvailable,
        addons: this.addons.map(({ id, name, price: addonPrice }) => ({ id, name, price: addonPrice })),
      });
    },
  },

  template: /*HTML*/`
    <main class="item-details-page admin-shell" :aria-label="pageTitle">
      <app-sidebar active="menu" @navigate="handleNavigation" @logout="$emit('logout')"></app-sidebar>

      <div class="item-details-main">
        <app-header :title="pageTitle" variant="page" show-back @back="$emit('back')"></app-header>

        <div class="details-page-container">
          <div class="details-workspace">
            <section class="details-photo" :aria-label="(form.name || 'Menu item') + ' photo'">
              <img :src="form.image" :alt="form.name || 'Menu item preview'" />
              <input ref="imageInput" class="details-file-input" type="file" accept="image/*" @change="handleImageUpload" />
              <button v-if="isAdmin" class="image-upload-button" type="button" @click="openImagePicker">
                <span class="material-symbols-outlined">add_a_photo</span>
                <span>Upload photo</span>
              </button>
            </section>

            <form class="details-card" aria-label="Menu item details form" @submit.prevent="submitItem">
              <!-- Admin View -->
              <div v-if="isAdmin">
                <div class="admin-details-field">
                  <label for="admin-item-name">Item Name</label>
                  <input id="admin-item-name" v-model="form.name" type="text" :disabled="!isAdmin" placeholder="Enter item name" />
                </div>

                <div class="admin-details-field">
                  <label for="admin-base-price">Base Price ($)</label>
                  <input id="admin-base-price" v-model="form.basePrice" type="number" min="0" step="0.01" inputmode="decimal" :disabled="!isAdmin" placeholder="0.00" />
                </div>

                <div class="admin-details-field admin-description-field">
                  <label for="admin-item-description">Description</label>
                  <textarea id="admin-item-description" v-model="form.description" rows="5" :disabled="!isAdmin" placeholder="Describe this menu item"></textarea>
                </div>

                <hr class="admin-details-divider" />
              
                <div class="admin-addons-heading">
                  <div>
                    <h3>Customize Your Item</h3>
                    <p>{{ isAdmin ? 'Edit optional add-ons and their additional price.' : 'Select from optional customizations.' }}</p>
                  </div>
                  <button class="admin-addon-add-button" type="button" aria-label="Add customization" @click="addAddon">
                    <span class="material-symbols-outlined">add_circle</span>
                  </button>
                </div>

                <div class="admin-details-addons">
                  <div v-for="addon in addons" :key="addon.id" class="admin-details-addon-row" :class="{ 'admin-editing': editingAddonId === addon.id }">
                    <template v-if="editingAddonId === addon.id">
                      <input v-model="addonDraft.name" class="admin-addon-name-input" :data-addon-input="addon.id" type="text" placeholder="Add-on name" />
                      <div class="admin-addon-price-input-wrap">
                        <span>+$</span>
                        <input v-model="addonDraft.price" type="number" min="0" step="0.01" inputmode="decimal" />
                      </div>
                      <div class="admin-addon-edit-actions">
                        <button type="button" aria-label="Save add-on" @click="saveAddon(addon)"><span class="material-symbols-outlined">check</span></button>
                        <button type="button" aria-label="Cancel add-on editing" @click="cancelAddon(addon)"><span class="material-symbols-outlined">close</span></button>
                      </div>
                    </template>
                    <template v-else>
                      <button class="admin-addon-edit-button" type="button" :aria-label="'Edit ' + addon.name" @click="editAddon(addon)">
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <span v-else></span>
                      <span class="admin-addon-name">{{ addon.name }}</span>
                      <strong class="admin-addon-price">+&#36;{{ Number(addon.price).toFixed(2) }}</strong>
                      <button class="admin-addon-remove-button" type="button" :aria-label="'Remove ' + addon.name" @click="removeAddon(addon)">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                      <span v-else></span>
                    </template>
                  </div>
                </div>
                <p v-if="addons.length === 0" class="admin-addons-empty">
                  {{ isAdmin ? 'No add-ons yet. Use the plus button to create one.' : 'No customizations available for this item.' }}
                </p>
              </div>

              <!-- Customer View -->
              <div v-if="!isAdmin">
                <div class="customer-item-details">
                  <p class="customer-item-name">{{ form.name }}</p>
                  <p class="customer-item-price">&#36;{{ form.basePrice }}</p>
                  <p class="customer-item-description">{{ form.description }}</p>
                </div>

                <hr class="customer-details-divider" />
              
                <div class="customer-item-addons-heading">
                  <div>
                    <h3>Customize Your Item</h3>
                    <p>Select from optional customizations.</p>
                  </div>
                </div>

                <div class="customer-details-addons">
                  <div v-for="addon in addons" :key="addon.id" class="customer-details-addon-row">
                    <div class="customer-addon-info">
                      <span class="customer-addon-name">{{ addon.name }}</span>
                      <span class="customer-addon-price">+&#36;{{ Number(addon.price).toFixed(2) }}</span>
                    </div>
                    <div class="customer-addon-quantity-selector">
                      <button type="button" class="customer-quantity-btn" @click="addon.quantity = Math.max(0, addon.quantity - 1)" :disabled="addon.quantity <= 0">
                        <span class="material-symbols-outlined">remove</span>
                      </button>
                      <span class="customer-quantity-value">{{ addon.quantity }}</span>
                      <button type="button" class="customer-quantity-btn" @click="addon.quantity = (addon.quantity || 0) + 1">
                        <span class="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>
                  <p v-if="addons.length === 0" class="customer-addons-empty">No customizations available for this item.</p>
                </div>

                <div class="customer-instructions-field">
                  <label for="customer-special-instructions" class="customer-instructions-label">Special Instructions</label>
                  <textarea id="customer-special-instructions" v-model="specialInstructions" class="customer-instructions-textarea" placeholder="Add any special instructions (e.g. less spicy, allergy notes)..."></textarea>
                </div>
              </div>

              <p v-if="validationMessage || serverError" class="details-validation" role="alert">{{ validationMessage || serverError }}</p>

              <div class="details-actions">
                <button v-if="isAdmin && isEditing" class="details-delete-button" type="button" @click="$emit('delete', item)">
                  <span class="material-symbols-outlined">delete</span>
                  <span>Delete Item</span>
                </button>
                <button class="details-save-button" type="submit" :disabled="!canSubmit">
                  {{ isAdmin ? (saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Item')) : 'Add to Order' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <bottom-navigation active="menu" @navigate="handleNavigation"></bottom-navigation>
    </main>
  `,
};
