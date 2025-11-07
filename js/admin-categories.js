/**
 * Admin Categories JavaScript
 * Handles category CRUD operations and dashboard functionality
 */

// State
let categories = [];
let editingCategoryId = null;
let deleteCallback = null;

// DOM Elements
const categoriesTable = document.getElementById('categories-table');
const addCategoryBtn = document.getElementById('add-category-btn');
const categoryModal = document.getElementById('category-modal');
const categoryForm = document.getElementById('category-form');
const categoryModalTitle = document.getElementById('category-modal-title');
const deleteModal = document.getElementById('delete-modal');
const deleteModalTitle = document.getElementById('delete-modal-title');
const deleteModalMessage = document.getElementById('delete-modal-message');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const logoutBtn = document.getElementById('logout-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initNavigation();
    initModals();
    loadDashboardStats();
    loadCategories();

    // Add category button
    addCategoryBtn.addEventListener('click', () => openCategoryModal());

    // Logout
    logoutBtn.addEventListener('click', handleLogout);
});

/**
 * Check authentication
 */
async function checkAuth() {
    try {
        const response = await fetch('api/auth/check.php');
        const data = await response.json();

        if (!data.success || !data.data.authenticated) {
            window.location.href = 'admin-login.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'admin-login.html';
    }
}

/**
 * Initialize navigation
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const targetSection = item.dataset.section;

            // Update nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update sections
            sections.forEach(section => section.classList.remove('active'));
            const target = document.getElementById(`section-${targetSection}`);
            if (target) {
                target.classList.add('active');
            }

            // Reload data if needed
            if (targetSection === 'dashboard') {
                loadDashboardStats();
            } else if (targetSection === 'categories') {
                loadCategories();
            }
        });
    });
}

/**
 * Initialize modals
 */
function initModals() {
    // Close modal buttons
    const modalCloses = document.querySelectorAll('.modal-close, .modal-cancel');
    modalCloses.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Click outside modal to close
    [categoryModal, deleteModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    // Category form submit
    categoryForm.addEventListener('submit', handleCategorySubmit);

    // Delete confirm
    confirmDeleteBtn.addEventListener('click', () => {
        if (deleteCallback) {
            deleteCallback();
        }
    });
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    try {
        // Load categories for count
        const catResponse = await fetch('api/categories/list.php');
        const catData = await catResponse.json();

        // Load items for stats
        const itemsResponse = await fetch('api/items/list.php');
        const itemsData = await itemsResponse.json();

        if (catData.success && itemsData.success) {
            const categories = catData.data.categories || [];
            const items = itemsData.data.items || [];

            // Total items
            document.getElementById('stat-total-items').textContent = items.length;

            // Total categories
            document.getElementById('stat-total-categories').textContent = categories.length;

            // Average price
            if (items.length > 0) {
                const avgPrice = items.reduce((sum, item) => sum + parseFloat(item.price), 0) / items.length;
                document.getElementById('stat-avg-price').textContent = avgPrice.toFixed(2) + ' ر.س';
            } else {
                document.getElementById('stat-avg-price').textContent = '0 ر.س';
            }

            // Max price
            if (items.length > 0) {
                const maxPrice = Math.max(...items.map(item => parseFloat(item.price)));
                document.getElementById('stat-max-price').textContent = maxPrice.toFixed(2) + ' ر.س';
            } else {
                document.getElementById('stat-max-price').textContent = '0 ر.س';
            }
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

/**
 * Load categories
 */
async function loadCategories() {
    try {
        categoriesTable.innerHTML = '<tr><td colspan="5" class="loading-cell">جاري التحميل...</td></tr>';

        const response = await fetch('api/categories/list.php');
        const data = await response.json();

        if (data.success && data.data.categories) {
            categories = data.data.categories;
            renderCategories();
        } else {
            categoriesTable.innerHTML = '<tr><td colspan="5" class="loading-cell">لا توجد فئات</td></tr>';
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        categoriesTable.innerHTML = '<tr><td colspan="5" class="loading-cell">حدث خطأ في التحميل</td></tr>';
    }
}

/**
 * Render categories table
 */
function renderCategories() {
    if (categories.length === 0) {
        categoriesTable.innerHTML = '<tr><td colspan="5" class="loading-cell">لا توجد فئات</td></tr>';
        return;
    }

    const html = categories.map(category => `
        <tr>
            <td><span style="font-size: 2rem;">${category.icon}</span></td>
            <td>${category.name}</td>
            <td>${category.item_count || 0}</td>
            <td>${category.display_order}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" onclick="editCategory(${category.id})" title="تعديل">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon danger" onclick="deleteCategory(${category.id}, '${category.name}', ${category.item_count})" title="حذف">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    categoriesTable.innerHTML = html;
}

/**
 * Open category modal (add or edit)
 */
function openCategoryModal(category = null) {
    editingCategoryId = category ? category.id : null;

    if (category) {
        // Edit mode
        categoryModalTitle.textContent = 'تعديل الفئة';
        document.getElementById('category-id').value = category.id;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-icon').value = category.icon;
        document.getElementById('category-order').value = category.display_order;
    } else {
        // Add mode
        categoryModalTitle.textContent = 'إضافة فئة جديدة';
        categoryForm.reset();
    }

    categoryModal.classList.add('active');
}

/**
 * Handle category form submit
 */
async function handleCategorySubmit(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('category-name').value,
        icon: document.getElementById('category-icon').value,
        display_order: parseInt(document.getElementById('category-order').value) || 0
    };

    try {
        const url = editingCategoryId
            ? 'api/categories/update.php'
            : 'api/categories/create.php';

        const method = editingCategoryId ? 'PUT' : 'POST';

        if (editingCategoryId) {
            formData.id = editingCategoryId;
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            closeAllModals();
            loadCategories();
            loadDashboardStats();
        } else {
            alert(data.message || 'حدث خطأ');
        }
    } catch (error) {
        console.error('Error saving category:', error);
        alert('حدث خطأ في الاتصال');
    }
}

/**
 * Edit category
 */
function editCategory(id) {
    const category = categories.find(c => c.id == id);
    if (category) {
        openCategoryModal(category);
    }
}

/**
 * Delete category
 */
function deleteCategory(id, name, itemCount) {
    deleteModalTitle.textContent = 'تأكيد حذف الفئة';

    if (itemCount > 0) {
        deleteModalMessage.innerHTML = `
            <strong style="color: var(--error-red);">تحذير!</strong><br><br>
            الفئة "<strong>${name}</strong>" تحتوي على <strong>${itemCount}</strong> صنف.<br>
            سيتم حذف جميع الأصناف المرتبطة بها.<br><br>
            هل أنت متأكد؟
        `;
    } else {
        deleteModalMessage.innerHTML = `
            هل أنت متأكد من حذف الفئة "<strong>${name}</strong>"؟
        `;
    }

    deleteCallback = async () => {
        try {
            const response = await fetch('api/categories/delete.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            const data = await response.json();

            if (data.success) {
                closeAllModals();
                loadCategories();
                loadDashboardStats();
            } else {
                alert(data.message || 'حدث خطأ في الحذف');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('حدث خطأ في الاتصال');
        }
    };

    deleteModal.classList.add('active');
}

/**
 * Close all modals
 */
function closeAllModals() {
    categoryModal.classList.remove('active');
    deleteModal.classList.remove('active');
    editingCategoryId = null;
    deleteCallback = null;
}

/**
 * Handle logout
 */
async function handleLogout(e) {
    e.preventDefault();

    try {
        const response = await fetch('api/auth/logout.php', {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = 'admin-login.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'admin-login.html';
    }
}

// Make functions globally accessible
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
