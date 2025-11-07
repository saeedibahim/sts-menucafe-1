/**
 * Admin Settings JavaScript
 * Handles cafe settings management
 */

// DOM Elements
const settingsForm = document.getElementById('settings-form');
const cafeNameInput = document.getElementById('cafe-name');
const logoFileInput = document.getElementById('logo-file');
let currentLogoUrl = '';

// Initialize when section becomes active
document.addEventListener('DOMContentLoaded', () => {
    // Load settings when settings section is clicked
    const settingsNavItem = document.querySelector('.nav-item[data-section="settings"]');
    if (settingsNavItem) {
        settingsNavItem.addEventListener('click', loadSettings);
    }

    // Settings form submit
    settingsForm.addEventListener('submit', handleSettingsSubmit);

    // Logo preview on file select
    if (logoFileInput) {
        logoFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('logo-preview-img').src = event.target.result;
                    document.getElementById('logo-preview').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
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
            currentLogoUrl = settings.logo_url || '';

            // Show current logo if available
            if (currentLogoUrl && currentLogoUrl.trim() !== '') {
                document.getElementById('logo-preview-img').src = currentLogoUrl;
                document.getElementById('logo-preview').style.display = 'block';
            } else {
                document.getElementById('logo-preview').style.display = 'none';
            }
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

    const cafeName = cafeNameInput.value;
    const logoFile = logoFileInput.files[0];

    try {
        let logo_url = currentLogoUrl; // Keep current logo if no new file selected

        // Upload logo if file is selected
        if (logoFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('logo', logoFile);

            const uploadResponse = await fetch('api/settings/upload-logo.php', {
                method: 'POST',
                body: uploadFormData
            });

            const uploadData = await uploadResponse.json();

            if (!uploadData.success) {
                alert(uploadData.message || 'حدث خطأ أثناء رفع الشعار');
                return;
            }

            logo_url = uploadData.data.logo_url;
        }

        // Save settings
        const settingsData = {
            cafe_name: cafeName,
            logo_url: logo_url,
            whatsapp: '+966500000000', // Company contact (not editable)
            instagram: '@sts_software'  // Company contact (not editable)
        };

        const response = await fetch('api/settings/update.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settingsData)
        });

        const data = await response.json();

        if (data.success) {
            currentLogoUrl = logo_url;
            alert('تم حفظ الإعدادات بنجاح');
        } else {
            alert(data.message || 'حدث خطأ أثناء حفظ الإعدادات');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('حدث خطأ في الاتصال');
    }
}
