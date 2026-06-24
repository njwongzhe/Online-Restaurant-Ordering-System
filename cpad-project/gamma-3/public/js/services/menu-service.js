import { apiRequest } from './api-client.js';

function imageUrl(path) {
  if (!path) return '../assets/images/No%20Menu%20Image.png';
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;
  return `../${path.split('/').map(encodeURIComponent).join('/')}`;
}

function mapItem(item) {
  return {
    id: Number(item.menu_item_id),
    name: item.name,
    description: item.description || '',
    price: `RM${Number(item.price).toFixed(2)}`,
    image: imageUrl(item.image_path),
    isAvailable: Boolean(Number(item.is_available)),
    addons: (item.addons || []).map((addon) => ({ id: Number(addon.addon_id), name: addon.name, price: Number(addon.price) })),
  };
}

export async function loadMenu() {
  const { categories } = await apiRequest('/menu');
  return categories.map((category) => ({
    id: Number(category.category_id),
    name: category.name,
    isAvailable: Boolean(Number(category.is_available)),
    items: (category.items || []).map(mapItem),
  }));
}

export const createCategory = (name) => apiRequest('/categories', { method: 'POST', body: JSON.stringify({ name }) });
export const updateCategory = (id, changes) => apiRequest(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
export const deleteCategory = (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' });
export const setItemAvailability = (id, isAvailable) => apiRequest(`/menu-items/${id}/availability`, { method: 'PATCH', body: JSON.stringify({ is_available: isAvailable }) });
export const deleteMenuItem = (id) => apiRequest(`/menu-items/${id}`, { method: 'DELETE' });

function itemFormData(item) {
  const form = new FormData();
  form.append('name', item.name);
  form.append('price', item.price);
  form.append('description', item.description || '');
  form.append('is_available', item.isAvailable ? '1' : '0');
  form.append('addons', JSON.stringify(item.addons || []));
  if (item.imageFile) form.append('image', item.imageFile);
  return form;
}

export const createMenuItem = (categoryId, item) => apiRequest(`/categories/${categoryId}/items`, { method: 'POST', body: itemFormData(item) });
export const updateMenuItem = (id, item) => apiRequest(`/menu-items/${id}`, { method: 'POST', body: itemFormData(item) });
