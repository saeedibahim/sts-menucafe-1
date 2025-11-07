/**
 * Admin Settings JavaScript
 * Handles cafe settings management
 */

// DOM Elements
const settingsForm = document.getElementById('settings-form');
const cafeNameInput = document.getElementById('cafe-name');
const logoUrlInput = document.getElementById('logo-url');

// Initialize when section becomes active
document.addEventListener('DOMContentLoaded', () => {
    // Load settings when settings section is clicked
    const settingsNavItem = document.querySelector('.nav-item[data-section="settings"]');
    if (settingsNavItem) {
        settingsNavItem.addEventListener('click', loadSettings);
    }

    // Settings form submit
    settingsForm.addEventListener('submit', handleSettingsSubmit);
});

/**
 * Load settings
 */
async function loadSettings() {
    try {
        const response = await fetch('api/settings/get.php');
        const data = await response.json();

        if (data.success && data.data.settings) {
            const settings = data.data.settings;

            cafeNameInput.value = settings.cafe_name || '';
            logoUrlInput.value = settings.logo_url || '';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        alert('حدث خطأ أثناء تحميل الإعدادات');
    }
}

/**
 * Handle settings form submit
 */
async function handleSettingsSubmit(e) {
    e.preventDefault();

    const formData = {
        cafe_name: cafeNameInput.value,
        logo_url: logoUrlInput.value,
        whatsapp: '+966500000000', // Company contact (not editable)
        instagram: '@sts_software'  // Company contact (not editable)
    };

    try {
        const response = await fetch('api/settings/update.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            alert('تم حفظ الإعدادات بنجاح');
        } else {
            alert(data.message || 'حدث خطأ أثناء حفظ الإعدادات');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('حدث خطأ في الاتصال');
    }
}
