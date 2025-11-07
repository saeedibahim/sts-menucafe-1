/**
 * Admin Items JavaScript
 * Handles item CRUD operations
 */

// State
let items = [];
let itemCategories = [];
let editingItemId = null;
let deleteItemCallback = null;

// DOM Elements
const itemsTable = document.getElementById('items-table');
const addItemBtn = document.getElementById('add-item-btn');
const itemModal = document.getElementById('item-modal');
const itemForm = document.getElementById('item-form');
const itemModalTitle = document.getElementById('item-modal-title');
const filterCategory = document.getElementById('filter-category');
const itemCategorySelect = document.getElementById('item-category');

// Initialize when section becomes active
document.addEventListener('DOMContentLoaded', () => {
    // Load items when items section is clicked
    const itemsNavItem = document.querySelector('.nav-item[data-section="items"]');
    if (itemsNavItem) {
        itemsNavItem.addEventListener('click', () => {
            loadItemCategories();
            loadItems();
        });
    }

    // Add item button
    addItemBtn.addEventListener('click', () => openItemModal());

    // Item form submit
    itemForm.addEventListener('submit', handleItemSubmit);

    // Filter by category
    filterCategory.addEventListener('change', loadItems);
});

/**
 * Load categories for dropdowns
 */
async function loadItemCategories() {
    try {
        const response = await fetch('api/categories/list.php');
        const data = await response.json();

        if (data.success && data.data.categories) {
            itemCategories = data.data.categories;
            populateCategoryDropdowns();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

/**
 * Populate category dropdowns
 */
function populateCategoryDropdowns() {
    // Filter dropdown
    const filterOptions = itemCategories.map(cat =>
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
    filterCategory.innerHTML = '<option value="">الكل</option>' + filterOptions;

    // Item form dropdown (hidden select)
    const itemOptions = itemCategories.map(cat =>
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
    itemCategorySelect.innerHTML = '<option value="">اختر الفئة</option>' + itemOptions;

    // Custom select dropdown
    const customSelectOptions = document.querySelector('#custom-category-select .custom-select-options');
    if (customSelectOptions) {
        const customOptions = [
            { id: '', name: 'اختر الفئة' },
            ...itemCategories
        ].map(cat =>
            `<div class="custom-select-option" data-value="${cat.id}">${cat.name}</div>`
        ).join('');
        customSelectOptions.innerHTML = customOptions;

        // Initialize custom select
        initCustomSelect();
    }
}

/**
 * Initialize custom select functionality
 */
function initCustomSelect() {
    const customSelect = document.getElementById('custom-category-select');
    const trigger = customSelect.querySelector('.custom-select-trigger');
    const options = customSelect.querySelector('.custom-select-options');
    const selectText = customSelect.querySelector('.custom-select-text');
    const hiddenSelect = document.getElementById('item-category');

    // Toggle dropdown
    trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        trigger.classList.toggle('active');
        options.classList.toggle('active');
    });

    // Handle option selection
    options.addEventListener('click', function(e) {
        if (e.target.classList.contains('custom-select-option')) {
            const value = e.target.dataset.value;
            const text = e.target.textContent;

            // Update hidden select
            hiddenSelect.value = value;

            // Update display text
            selectText.textContent = text;

            // Update selected state
            options.querySelectorAll('.custom-select-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            e.target.classList.add('selected');

            // Close dropdown
            trigger.classList.remove('active');
            options.classList.remove('active');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!customSelect.contains(e.target)) {
            trigger.classList.remove('active');
            options.classList.remove('active');
        }
    });
}

/**
 * Load items
 */
async function loadItems() {
    try {
        itemsTable.innerHTML = '<tr><td colspan="6" class="loading-cell">جاري التحميل...</td></tr>';

        const categoryId = filterCategory.value;
        const url = categoryId
            ? `api/items/list.php?category_id=${categoryId}`
            : 'api/items/list.php';

        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data.items) {
            items = data.data.items;
            renderItems();
        } else {
            itemsTable.innerHTML = '<tr><td colspan="6" class="loading-cell">لا توجد أصناف</td></tr>';
        }
    } catch (error) {
        console.error('Error loading items:', error);
        itemsTable.innerHTML = '<tr><td colspan="6" class="loading-cell">حدث خطأ في التحميل</td></tr>';
    }
}

/**
 * Render items table
 */
function renderItems() {
    if (items.length === 0) {
        itemsTable.innerHTML = '<tr><td colspan="6" class="loading-cell">لا توجد أصناف</td></tr>';
        return;
    }

    const html = items.map(item => {
        const imageHTML = item.image_url && item.image_url.trim() !== ''
            ? `<img src="${item.image_url}" alt="${item.name}" class="item-thumb">`
            : `<div class="item-thumb-placeholder">${item.category_icon || '🍽️'}</div>`;

        return `
            <tr>
                <td>${imageHTML}</td>
                <td><strong>${item.name}</strong></td>
                <td>${item.category_name || 'غير محدد'}</td>
                <td>${item.description || '-'}</td>
                <td><strong>${parseFloat(item.price).toFixed(2)} ر.س</strong></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon" onclick="editItem(${item.id})" title="تعديل">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon danger" onclick="deleteItem(${item.id}, '${item.name.replace(/'/g, "\\'")}' )" title="حذف">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    itemsTable.innerHTML = html;
}

/**
 * Open item modal (add or edit)
 */
function openItemModal(item = null) {
    editingItemId = item ? item.id : null;

    // Reset form
    itemForm.reset();
    document.getElementById('image-preview').style.display = 'none';

    // Reset custom select
    const customSelectText = document.querySelector('#custom-category-select .custom-select-text');
    const customSelectOptions = document.querySelectorAll('#custom-category-select .custom-select-option');

    if (item) {
        // Edit mode
        itemModalTitle.textContent = 'تعديل الصنف';
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-category').value = item.category_id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-description').value = item.description || '';
        document.getElementById('item-price').value = item.price;

        // Update custom select display
        const selectedCategory = itemCategories.find(cat => cat.id == item.category_id);
        if (selectedCategory && customSelectText) {
            customSelectText.textContent = selectedCategory.name;
            customSelectOptions.forEach(opt => {
                opt.classList.remove('selected');
                if (opt.dataset.value == item.category_id) {
                    opt.classList.add('selected');
                }
            });
        }

        // Show existing image if available
        if (item.image_url && item.image_url.trim() !== '') {
            document.getElementById('preview-img').src = item.image_url;
            document.getElementById('image-preview').style.display = 'block';
        }
    } else {
        // Add mode
        itemModalTitle.textContent = 'إضافة صنف جديد';
        if (customSelectText) {
            customSelectText.textContent = 'اختر الفئة';
        }
        customSelectOptions.forEach(opt => opt.classList.remove('selected'));
    }

    itemModal.classList.add('active');
}

// Add image preview on file select
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('item-image');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('preview-img').src = event.target.result;
                    document.getElementById('image-preview').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

/**
 * Handle item form submit
 */
async function handleItemSubmit(e) {
    e.preventDefault();

    const category_id = document.getElementById('item-category').value;
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const imageFile = document.getElementById('item-image').files[0];

    if (!category_id) {
        alert('الرجاء اختيار الفئة');
        return;
    }

    try {
        let image_url = '';

        // Upload image if file is selected
        if (imageFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('image', imageFile);

            const uploadResponse = await fetch('api/items/upload.php', {
                method: 'POST',
                body: uploadFormData
            });

            const uploadData = await uploadResponse.json();

            if (!uploadData.success) {
                alert(uploadData.message || 'حدث خطأ أثناء رفع الصورة');
                return;
            }

            image_url = uploadData.data.image_url;
        }

        // Prepare item data
        const itemData = {
            category_id: category_id,
            name: name,
            description: description,
            price: price,
            image_url: image_url
        };

        if (editingItemId) {
            itemData.id = editingItemId;
        }

        // Save item
        const url = editingItemId
            ? 'api/items/update.php'
            : 'api/items/create.php';

        const method = editingItemId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });

        const data = await response.json();

        if (data.success) {
            itemModal.classList.remove('active');
            loadItems();
        } else {
            alert(data.message || 'حدث خطأ');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        alert('حدث خطأ في الاتصال');
    }
}

/**
 * Edit item
 */
function editItem(id) {
    const item = items.find(i => i.id == id);
    if (item) {
        openItemModal(item);
    }
}

/**
 * Delete item
 */
function deleteItem(id, name) {
    const deleteModal = document.getElementById('delete-modal');
    const deleteModalTitle = document.getElementById('delete-modal-title');
    const deleteModalMessage = document.getElementById('delete-modal-message');

    deleteModalTitle.textContent = 'تأكيد حذف الصنف';
    deleteModalMessage.innerHTML = `هل أنت متأكد من حذف الصنف "<strong>${name}</strong>"؟`;

    deleteItemCallback = async () => {
        try {
            const response = await fetch('api/items/delete.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            const data = await response.json();

            if (data.success) {
                deleteModal.classList.remove('active');
                loadItems();
            } else {
                alert(data.message || 'حدث خطأ في الحذف');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('حدث خطأ في الاتصال');
        }
    };

    // Update delete button handler
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    confirmDeleteBtn.onclick = () => {
        if (deleteItemCallback) {
            deleteItemCallback();
        }
    };

    deleteModal.classList.add('active');
}

// Make functions globally accessible
window.editItem = editItem;
window.deleteItem = deleteItem;
