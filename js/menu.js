/**
 * Customer Menu JavaScript
 * Handles menu display, search, and filtering
 */

// State
let allItems = [];
let allCategories = [];
let currentCategory = 'all';
let searchQuery = '';

// DOM Elements
const categoryTabs = document.getElementById('category-tabs');
const itemsGrid = document.getElementById('items-grid');
const searchInput = document.getElementById('search-input');
const cafeName = document.getElementById('cafe-name');
const cafeLogo = document.getElementById('cafe-logo');
const whatsappLink = document.getElementById('whatsapp-link');
const whatsappNumber = document.getElementById('whatsapp-number');
const instagramLink = document.getElementById('instagram-link');
const instagramHandle = document.getElementById('instagram-handle');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadCategories();
    loadItems();

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        filterItems();
    });
});

/**
 * Load cafe settings
 */
async function loadSettings() {
    try {
        const response = await fetch('api/settings/get.php');
        const data = await response.json();

        if (data.success && data.data.settings) {
            const settings = data.data.settings;

            // Update cafe name
            if (settings.cafe_name) {
                cafeName.textContent = settings.cafe_name;
            }

            // Update logo
            if (settings.logo_url && settings.logo_url.trim() !== '') {
                cafeLogo.innerHTML = `<img src="${settings.logo_url}" alt="${settings.cafe_name}">`;
            }

            // Update WhatsApp
            if (settings.whatsapp) {
                whatsappNumber.textContent = settings.whatsapp;
                whatsappLink.href = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`;
            }

            // Update Instagram
            if (settings.instagram) {
                instagramHandle.textContent = settings.instagram;
                const handle = settings.instagram.replace('@', '');
                instagramLink.href = `https://instagram.com/${handle}`;
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

/**
 * Load categories
 */
async function loadCategories() {
    try {
        const response = await fetch('api/categories/list.php');
        const data = await response.json();

        if (data.success && data.data.categories) {
            allCategories = data.data.categories;
            renderCategories();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

/**
 * Render category tabs
 */
function renderCategories() {
    // Keep "All" tab and add dynamic categories
    const dynamicTabs = allCategories.map(category => `
        <button class="category-tab" data-category="${category.id}">
            <span class="tab-icon">${category.icon}</span>
            <span class="tab-name">${category.name}</span>
        </button>
    `).join('');

    // Append to existing tabs (after "All")
    categoryTabs.innerHTML = `
        <button class="category-tab active" data-category="all">
            <span class="tab-icon">🌟</span>
            <span class="tab-name">الكل</span>
        </button>
        ${dynamicTabs}
    `;

    // Add event listeners
    const tabs = categoryTabs.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Update current category
            currentCategory = tab.dataset.category;

            // Filter items
            filterItems();
        });
    });
}

/**
 * Load items
 */
async function loadItems() {
    try {
        itemsGrid.innerHTML = '<div class="loading">جاري التحميل...</div>';

        const response = await fetch('api/items/list.php');
        const data = await response.json();

        if (data.success && data.data.items) {
            allItems = data.data.items;
            filterItems();
        } else {
            itemsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p class="empty-state-text">لا توجد أصناف في القائمة</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading items:', error);
        itemsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <p class="empty-state-text">حدث خطأ أثناء تحميل القائمة</p>
            </div>
        `;
    }
}

/**
 * Filter items based on category and search query
 */
function filterItems() {
    let filtered = allItems;

    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(item => item.category_id == currentCategory);
    }

    // Filter by search query
    if (searchQuery) {
        filtered = filtered.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(searchQuery);
            const descMatch = item.description && item.description.toLowerCase().includes(searchQuery);
            return nameMatch || descMatch;
        });
    }

    renderItems(filtered);
}

/**
 * Render items
 */
function renderItems(items) {
    if (items.length === 0) {
        itemsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p class="empty-state-text">لم يتم العثور على نتائج</p>
            </div>
        `;
        return;
    }

    const itemsHTML = items.map(item => {
        const imageHTML = item.image_url && item.image_url.trim() !== ''
            ? `<img src="${item.image_url}" alt="${item.name}">`
            : `<span class="item-placeholder">${item.category_icon || '🍽️'}</span>`;

        return `
            <div class="item-card">
                <div class="item-image">
                    ${imageHTML}
                </div>
                <div class="item-content">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${item.description || ''}</p>
                    <div class="item-price">${parseFloat(item.price).toFixed(2)} ر.س</div>
                </div>
            </div>
        `;
    }).join('');

    itemsGrid.innerHTML = itemsHTML;
}
