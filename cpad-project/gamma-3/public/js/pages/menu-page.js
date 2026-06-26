import MenuItemDetailsPage from './menu-item-details-page.js';
import { loadMenu, createCategory, updateCategory, deleteCategory, createMenuItem, updateMenuItem, deleteMenuItem, setItemAvailability } from '../services/menu-service.js';
import { addToCart, getCart } from '../services/cart-service.js';

export default {
  name: 'MenuPage',

  components: { MenuItemDetailsPage },

  emits: [
    'category-created',
    'category-updated',
    'category-availability-change',
    'item-created',
    'item-updated',
    'item-availability-change',
    'navigate',
    'logout',
  ],

  data() {
    return {
      activeFilter: 'all',
      searchQuery: '',
      categories: [],
      editingCategoryId: null,
      categoryNameDraft: '',
      activeView: 'menu',
      selectedCategoryId: null,
      selectedItem: {},
      loading: true,
      saving: false,
      errorMessage: '',
      cartCount: Number(localStorage.getItem('cartCount') || 0),
    };
  },

  computed: {
    isAdmin() {
      const role = localStorage.getItem('role') || 'customer';
      return role === 'admin';
    },

    visibleCategories() {
      const keyword = this.searchQuery.trim().toLowerCase();

      return this.categories
        .filter((category) => this.activeFilter === 'all' || category.id === Number(this.activeFilter))
        .map((category) => ({
          ...category,
          visibleItems: category.items.filter((item) => {
            if (!keyword) return true;
            return item.name.toLowerCase().includes(keyword)
              || item.description.toLowerCase().includes(keyword);
          }),
        }))
        .filter((category) => !keyword || category.visibleItems.length > 0);
    },

    selectedCategoryName() {
      return this.categories.find((category) => category.id === this.selectedCategoryId)?.name || '';
    },
  },

  async mounted() {
    await this.refreshMenu();
    if (!this.isAdmin) {
      await this.syncCartCount();
    }
  },

  methods: {
    async refreshMenu() {
      this.loading = true;
      try { this.categories = await loadMenu(); this.errorMessage = ''; }
      catch (error) { this.errorMessage = error.message; }
      finally { this.loading = false; }
    },

    // Sync the cart badge count from the server so it's always accurate.
    async syncCartCount() {
      try {
        const data = await getCart();
        const count = data.total_quantity ?? 0;
        this.cartCount = count;
        localStorage.setItem('cartCount', count);
      } catch {
        // Keep the cached localStorage value on network failure.
      }
    },
    setFilter(filter) {
      this.activeFilter = filter;
    },

    addCategory() {
      const category = {
        id: `new-${Date.now()}`,
        name: '',
        isAvailable: true,
        items: [],
      };

      this.categories.unshift(category);
      this.activeFilter = 'all';
      this.searchQuery = '';
      this.editingCategoryId = category.id;
      this.categoryNameDraft = '';
      this.$nextTick(() => {
        const input = document.querySelector(`[data-category-input="${category.id}"]`);
        input?.focus();
        input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    },

    editCategory(category) {
      this.editingCategoryId = category.id;
      this.categoryNameDraft = category.name;
      this.$nextTick(() => {
        const input = document.querySelector(`[data-category-input="${category.id}"]`);
        input?.focus();
        input?.select();
      });
    },

    async saveCategoryName(category) {
      if (this.editingCategoryId !== category.id) return;

      const storedCategory = this.categories.find((entry) => entry.id === category.id);
      if (!storedCategory) return;

      const wasNew = String(storedCategory.id).startsWith('new-');
      const newName = this.categoryNameDraft.trim();
      if (!newName) { this.errorMessage = 'Category name cannot be empty.'; this.$nextTick(() => document.querySelector(`[data-category-input="${category.id}"]`)?.focus()); return; }
      try {
        if (wasNew) await createCategory(newName);
        else await updateCategory(storedCategory.id, { name: newName });
        this.editingCategoryId = null;
        this.categoryNameDraft = '';
        await this.refreshMenu();
      } catch (error) { this.errorMessage = error.message; this.$nextTick(() => document.querySelector(`[data-category-input="${category.id}"]`)?.focus()); }
    },

    async toggleCategory(category) {
      const storedCategory = this.categories.find((entry) => entry.id === category.id);
      if (!storedCategory) return;

      storedCategory.isAvailable = !storedCategory.isAvailable;
      try { await updateCategory(storedCategory.id, { is_available: storedCategory.isAvailable }); }
      catch (error) { storedCategory.isAvailable = !storedCategory.isAvailable; this.errorMessage = error.message; }
    },

    async removeCategory(category) {
      if (!window.confirm(`Delete ${category.name} and all of its menu items?`)) return;
      try { await deleteCategory(category.id); await this.refreshMenu(); }
      catch (error) { this.errorMessage = error.message; }
    },

    addItem(category) {
      this.selectedCategoryId = category.id;
      this.selectedItem = {
        name: '',
        description: '',
        price: '',
        image: '',
        isAvailable: true,
      };
      this.activeView = 'item-details';
    },

    editItem(category, item) {
      this.selectedCategoryId = category.id;
      this.selectedItem = {
        ...item,
        addons: item.addons?.map((addon) => ({ ...addon })) || [],
      };
      this.activeView = 'item-details';
    },

    closeItemDetails() {
      this.activeView = 'menu';
      this.selectedCategoryId = null;
      this.selectedItem = {};
    },

    async saveItemDetails(itemDetails) {
      if (!this.isAdmin) {
        this.saving = true;
        this.errorMessage = '';
        try {
          await addToCart(
            itemDetails.menuItemId,
            itemDetails.quantity,
            itemDetails.specialInstructions,
            itemDetails.addons
          );
          this.cartCount += Number(itemDetails.quantity);
          localStorage.setItem('cartCount', this.cartCount);
          this.closeItemDetails();
        } catch (error) {
          this.errorMessage = error.message;
        } finally {
          this.saving = false;
        }
        return;
      }

      const category = this.categories.find((entry) => entry.id === this.selectedCategoryId);
      if (!category) return;

      this.saving = true;
      this.errorMessage = '';
      try {
        if (itemDetails.id) await updateMenuItem(itemDetails.id, itemDetails);
        else await createMenuItem(category.id, itemDetails);
        await this.refreshMenu();
        this.closeItemDetails();
      } catch (error) { this.errorMessage = error.message; }
      finally { this.saving = false; }
    },

    async deleteItem(itemToDelete) {
      const category = this.categories.find((entry) => entry.id === this.selectedCategoryId);
      if (!category) return;
      if (!window.confirm(`Delete ${itemToDelete.name}?`)) return;
      try { await deleteMenuItem(itemToDelete.id); await this.refreshMenu(); this.closeItemDetails(); }
      catch (error) { this.errorMessage = error.message; }
    },

    async toggleItem(category, item) {
      item.isAvailable = !item.isAvailable;
      try { await setItemAvailability(item.id, item.isAvailable); }
      catch (error) { item.isAvailable = !item.isAvailable; this.errorMessage = error.message; }
    },

    handleCartClick() {
      this.$emit('navigate', 'cart');
    },
  },

  template: /*HTML*/`
    <menu-item-details-page
      v-if="activeView === 'item-details'"
      :item="selectedItem"
      :category-name="selectedCategoryName"
      :saving="saving"
      :server-error="errorMessage"
      @back="closeItemDetails"
      @save="saveItemDetails"
      @delete="deleteItem"
      @navigate="$emit('navigate', $event)"
      @logout="$emit('logout')"
    ></menu-item-details-page>

    <main v-else class="phone admin-shell" aria-label="Lanita Restaurant Admin menu page">
      <app-sidebar active="menu" @navigate="$emit('navigate', $event)" @logout="$emit('logout')"></app-sidebar>

      <div class="admin-main">
        <app-header :title="isAdmin ? 'Lanita Restaurant (Admin)' : 'Lanita Restaurant'" show-logout @logout="$emit('logout')"></app-header>

        <div class="page-container">
          <section class="hero">
            <h1 class="hero-title">Campus Dining, Refined</h1>
            <p class="hero-copy">Freshly prepared ingredients delivered at the speed of campus life.</p>
          </section>

          <label class="search-box">
            <span class="material-symbols-outlined">search</span>
            <input v-model="searchQuery" type="search" placeholder="Search menu..." />
          </label>

          <div class="filters" aria-label="Menu filters">
            <button v-if="isAdmin" class="add-main" type="button" title="Add category" aria-label="Add category" @click="addCategory">
              <span class="material-symbols-outlined">add</span>
            </button>
            <button class="filter-pill" :class="{ active: activeFilter === 'all' }" type="button" @click="setFilter('all')">All Items</button>
            <button v-for="category in categories" :key="category.id" class="filter-pill" :class="{ active: activeFilter === category.id }" type="button" @click="setFilter(category.id)">{{ category.name }}</button>
          </div>

          <p v-if="errorMessage" class="details-validation" role="alert">{{ errorMessage }}</p>
          <div v-if="loading" class="menu-empty">Loading menu...</div>

          <template v-else>
            <div v-if="visibleCategories.length === 0" class="menu-empty">No menu items found</div>

            <div v-else class="menu-sections">
              <section v-for="category in visibleCategories" :key="category.id" class="category">
                <div class="category-head" :aria-label="category.name + ' controls'">
                  <input
                    v-if="editingCategoryId === category.id"
                    v-model="categoryNameDraft"
                    class="section-title category-name-input"
                    :data-category-input="category.id"
                    type="text"
                    aria-label="Category name"
                    placeholder="Category name"
                    @blur="saveCategoryName(category)"
                    @keydown.enter.prevent="$event.target.blur()"
                  />
                  <h2 v-else class="section-title">{{ category.name }}</h2>
                  <template v-if="isAdmin">
                    <button
                      class="mini-toggle"
                      :class="{ off: !category.isAvailable }"
                      type="button"
                      :title="category.name + (category.isAvailable ? ' available' : ' unavailable')"
                      :aria-pressed="category.isAvailable"
                      @click="toggleCategory(category)"
                    ></button>
                    <button class="section-edit" type="button" :title="'Edit ' + category.name" @click="editCategory(category)">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="section-edit" type="button" :title="'Delete ' + category.name" @click="removeCategory(category)">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </template>
                  <span class="section-rule"></span>
                  <button v-if="isAdmin" class="section-add" type="button" :title="'Add item to ' + category.name" @click="addItem(category)">
                    <span class="material-symbols-outlined">add</span>
                  </button>
                </div>

                <div class="category-list">
                  <menu-item-card
                    v-for="item in category.visibleItems"
                    :key="item.id"
                    :item="item"
                    :category-available="category.isAvailable"
                    :is-admin="isAdmin"
                    @toggle="toggleItem(category, item)"
                    @edit="editItem(category, item)"
                  ></menu-item-card>
                  <p v-if="category.visibleItems.length === 0" class="empty-category">No menu items in this category.</p>
                </div>
              </section>
            </div>
          </template>
        </div>
      </div>

      <cart-button v-if="!isAdmin" :count="cartCount" @click="handleCartClick"></cart-button>
      <bottom-navigation active="menu" @navigate="$emit('navigate', $event)"></bottom-navigation>
    </main>
  `,
};
