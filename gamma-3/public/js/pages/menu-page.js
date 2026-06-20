import referenceMenuItems from '../data/menu-data.js';
import MenuItemDetailsPage from './menu-item-details-page.js';

function createItem(item, index) {
  return {
    id: `menu-item-${index + 1}`,
    section: item.section,
    name: item.name,
    description: item.desc,
    price: item.price,
    image: item.img,
    isAvailable: true,
    isEditing: false,
  };
}

function createInitialCategories() {
  const items = referenceMenuItems.map(createItem);

  return [
    {
      id: 'food',
      name: 'Food Selection',
      isAvailable: true,
      items: items.filter((item) => item.section === 'food'),
    },
    {
      id: 'drink',
      name: 'Drink Selection',
      isAvailable: true,
      items: items.filter((item) => item.section === 'drink'),
    },
  ];
}

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
  ],

  data() {
    return {
      activeFilter: 'all',
      searchQuery: '',
      categories: createInitialCategories(),
      editingCategoryId: null,
      categoryNameDraft: '',
      nextCategoryNumber: 1,
      nextItemNumber: referenceMenuItems.length + 1,
      activeView: 'menu',
      selectedCategoryId: null,
      selectedItem: {},
    };
  },

  computed: {
    visibleCategories() {
      const keyword = this.searchQuery.trim().toLowerCase();

      return this.categories
        .filter((category) => this.activeFilter === 'all' || category.id === this.activeFilter)
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

  methods: {
    setFilter(filter) {
      this.activeFilter = filter;
    },

    addCategory() {
      const category = {
        id: `custom-${this.nextCategoryNumber++}`,
        name: '',
        isAvailable: true,
        items: [],
      };

      this.categories.push(category);
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

    saveCategoryName(category) {
      if (this.editingCategoryId !== category.id) return;

      const storedCategory = this.categories.find((entry) => entry.id === category.id);
      if (!storedCategory) return;

      const wasNew = !storedCategory.name;
      const newName = this.categoryNameDraft.trim() || 'New Category';
      storedCategory.name = newName;
      this.editingCategoryId = null;
      this.categoryNameDraft = '';
      this.$emit(wasNew ? 'category-created' : 'category-updated', { ...storedCategory });
    },

    toggleCategory(category) {
      const storedCategory = this.categories.find((entry) => entry.id === category.id);
      if (!storedCategory) return;

      storedCategory.isAvailable = !storedCategory.isAvailable;
      this.$emit('category-availability-change', {
        categoryId: storedCategory.id,
        isAvailable: storedCategory.isAvailable,
      });
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

    saveItemDetails(itemDetails) {
      const category = this.categories.find((entry) => entry.id === this.selectedCategoryId);
      if (!category) return;

      if (itemDetails.id) {
        const item = category.items.find((entry) => entry.id === itemDetails.id);
        if (item) Object.assign(item, itemDetails, { isEditing: false });
        this.$emit('item-updated', { categoryId: category.id, item: { ...itemDetails } });
      } else {
        const item = {
          ...itemDetails,
          id: `menu-item-${this.nextItemNumber++}`,
          section: category.id,
          isEditing: false,
        };
        category.items.push(item);
        this.$emit('item-created', { categoryId: category.id, item: { ...item } });
      }

      this.closeItemDetails();
    },

    deleteItem(itemToDelete) {
      const category = this.categories.find((entry) => entry.id === this.selectedCategoryId);
      if (!category) return;
      category.items = category.items.filter((item) => item.id !== itemToDelete.id);
      this.closeItemDetails();
    },

    toggleItem(category, item) {
      item.isAvailable = !item.isAvailable;
      this.$emit('item-availability-change', {
        categoryId: category.id,
        itemId: item.id,
        isAvailable: item.isAvailable,
      });
    },
  },

  template: `
    <menu-item-details-page
      v-if="activeView === 'item-details'"
      :item="selectedItem"
      :category-name="selectedCategoryName"
      @back="closeItemDetails"
      @save="saveItemDetails"
      @delete="deleteItem"
      @navigate="$emit('navigate', $event)"
    ></menu-item-details-page>

    <main v-else class="phone admin-shell" aria-label="Lanita Restaurant Admin menu page">
      <app-sidebar active="menu" @navigate="$emit('navigate', $event)"></app-sidebar>

      <div class="admin-main">
        <app-header title="Lanita Restaurant (Admin)" show-logout></app-header>

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
        <button class="add-main" type="button" title="Add category" aria-label="Add category" @click="addCategory">
          <span class="material-symbols-outlined">add</span>
        </button>
        <button class="filter-pill" :class="{ active: activeFilter === 'all' }" type="button" @click="setFilter('all')">All Items</button>
        <button class="filter-pill" :class="{ active: activeFilter === 'food' }" type="button" data-filter="food" @click="setFilter('food')">Food</button>
        <button class="filter-pill" :class="{ active: activeFilter === 'drink' }" type="button" data-filter="drink" @click="setFilter('drink')">Drink</button>
          </div>

          <div class="menu-sections">
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
            <button class="section-add" type="button" :title="'Add item to ' + category.name" @click="addItem(category)">
              <span class="material-symbols-outlined">add</span>
            </button>
            <span class="section-rule"></span>
          </div>

          <div class="category-list">
            <menu-item-card
              v-for="item in category.visibleItems"
              :key="item.id"
              :item="item"
              :category-available="category.isAvailable"
              @toggle="toggleItem(category, item)"
              @edit="editItem(category, item)"
            ></menu-item-card>
            <p v-if="category.visibleItems.length === 0" class="empty-category">No menu items in this category.</p>
          </div>
        </section>
          </div>
        </div>
      </div>

      <bottom-navigation active="menu" @navigate="$emit('navigate', $event)"></bottom-navigation>
    </main>
  `,
};
