/**
 * Authentication JavaScript
 * Handles login functionality
 */

// DOM Elements
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnLoading = document.getElementById('btn-loading');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already authenticated
    checkAuth();

    // Handle form submission
    loginForm.addEventListener('submit', handleLogin);
});

/**
 * Check if user is already authenticated
 */
async function checkAuth() {
    try {
        const response = await fetch('api/auth/check.php');
        const data = await response.json();

        if (data.success && data.data.authenticated) {
            // Redirect to admin dashboard
            window.location.href = 'admin.html';
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
    }
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();

    // Clear previous error
    hideError();

    // Get form values
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validate
    if (!email || !password) {
        showError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
        return;
    }

    // Show loading state
    setLoading(true);

    try {
        const response = await fetch('api/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            // Redirect to admin dashboard
            window.location.href = 'admin.html';
        } else {
            showError(data.message || 'حدث خطأ أثناء تسجيل الدخول');
            setLoading(false);
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى');
        setLoading(false);
    }
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
}

/**
 * Set loading state
 */
function setLoading(loading) {
    submitBtn.disabled = loading;

    if (loading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
    } else {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}
