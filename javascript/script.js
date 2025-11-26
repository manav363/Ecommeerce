// -----------------------------
// Constants
// -----------------------------
const TAX_RATE = 0.08;
const SHIPPING_COST = 10;
const SLIDER_INTERVAL = 5000;
const SEARCH_DEBOUNCE_MS = 300;
const FILTER_DEBOUNCE_MS = 150;
const CART_STORAGE_KEY = 'cart';

// -----------------------------
// Data (keeps product info consistent across pages)
// -----------------------------
const PRODUCTS = [
    { id: 1, name: "Luxury Gold Watch", price: 299.99, category: "watches", img: "images/product1.jpg", desc: "Experience luxury and elegance with our premium gold watch. Crafted with the finest materials and precision engineering, this timepiece is perfect for those who appreciate fine craftsmanship. Features a gold-plated case, genuine leather strap, and water-resistant design." },
    { id: 2, name: "Designer Handbag", price: 199.99, category: "bags", img: "images/product2.jpg", desc: "Chic designer handbag with high-quality leather and thoughtfully organized compartments." },
    { id: 3, name: "Premium Sunglasses", price: 149.99, category: "accessories", img: "images/product3.jpg", desc: "UV-protective lenses, lightweight frame — perfect for sunny days." },
    { id: 4, name: "Luxury Perfume", price: 89.99, category: "accessories", img: "images/product4.jpg", desc: "A timeless scent with warm and fresh notes." },
    { id: 5, name: "Diamond Necklace", price: 499.99, category: "jewelry", img: "images/product5.jpg", desc: "Sparkling diamond necklace crafted for special occasions." },
    { id: 6, name: "Silver Watch", price: 399.99, category: "watches", img: "images/product6.jpg", desc: "Sleek silver watch with modern mechanics and polished finish." },
    { id: 7, name: "Leather Tote", price: 249.99, category: "bags", img: "images/product7.jpg", desc: "Spacious leather tote with durable stitching and stylish design." },
    { id: 8, name: "Designer Belt", price: 79.99, category: "accessories", img: "images/product8.jpg", desc: "Classic designer belt with premium buckle." }
];

// Price filter ranges
const PRICE_RANGES = {
    low: { min: 0, max: 99.99 },
    medium: { min: 100, max: 300 },
    high: { min: 300.01, max: Infinity }
};

// -----------------------------
// Utility Functions
// -----------------------------
/**
 * Escapes HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Formats a number as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return `$${Number(amount).toFixed(2)}`;
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Validates cart item structure
 * @param {Object} item - Cart item to validate
 * @returns {boolean} True if valid
 */
function isValidCartItem(item) {
    return item && 
           typeof item.name === 'string' && 
           typeof item.price === 'number' && 
           item.price >= 0 &&
           typeof item.quantity === 'number' && 
           item.quantity > 0;
}

// -----------------------------
// Cart (in-memory + localStorage)
// -----------------------------
let cart = [];

/**
 * Loads cart from localStorage and validates items
 */
function loadCart() {
    try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Validate and filter out invalid items
            cart = Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
        } else {
            cart = [];
        }
    } catch (e) {
        console.error('Failed to load cart from localStorage', e);
        cart = [];
    }
    updateCartCount();
}

/**
 * Saves cart to localStorage
 */
function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error('Failed to save cart to localStorage', e);
        // Handle quota exceeded error
        if (e.name === 'QuotaExceededError') {
            console.warn('LocalStorage quota exceeded. Consider clearing old data.');
        }
    }
}

/**
 * Calculates cart totals
 * @returns {Object} Object with subtotal, shipping, tax, and total
 */
function getCartTotals() {
    const subtotal = cart.reduce((sum, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        return sum + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
    
    const shipping = subtotal > 0 ? SHIPPING_COST : 0;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + shipping + tax;
    
    return { 
        subtotal: Math.max(0, subtotal), 
        shipping: Math.max(0, shipping), 
        tax: Math.max(0, tax), 
        total: Math.max(0, total) 
    };
}

/**
 * Gets total item count in cart
 * @returns {number} Total quantity of items
 */
function getCartItemCount() {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
}

/**
 * Updates visual cart count in navigation - creates badge if needed
 */
function updateCartCount() {
    const count = getCartItemCount();
    const nav = document.querySelector('.nav-container');
    if (!nav) return;

    let badge = document.getElementById('cart-count-badge');
    if (!badge) {
        const cartLink = Array.from(nav.querySelectorAll('a')).find(
            a => a.getAttribute('href') === 'cart.html'
        );
        if (cartLink) {
            badge = document.createElement('span');
            badge.id = 'cart-count-badge';
            badge.style.cssText = 'background: #e74c3c; color: white; padding: 2px 6px; border-radius: 12px; font-size: 12px; margin-left: 8px; vertical-align: middle;';
            cartLink.parentNode.insertBefore(badge, cartLink.nextSibling);
        }
    }
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// -----------------------------
// Slider (index.html)
// -----------------------------
let slideIndex = 1;
let slideInterval = null;

/**
 * Shows slide at given index
 * @param {number} n - Slide index (1-based)
 */
function showSlides(n) {
    const slides = document.getElementsByClassName('slide');
    const dots = document.getElementsByClassName('dot');
    if (!slides || slides.length === 0) return;

    // Normalize index
    if (n > slides.length) slideIndex = 1;
    else if (n < 1) slideIndex = slides.length;
    else slideIndex = n;

    // Hide all slides
    Array.from(slides).forEach(slide => {
        slide.style.opacity = '0';
        slide.classList.remove('active');
    });
    
    // Remove active class from all dots
    Array.from(dots).forEach(dot => {
        dot.classList.remove('active');
    });

    // Show current slide
    const currentSlide = slides[slideIndex - 1];
    if (currentSlide) {
        currentSlide.style.opacity = '1';
        currentSlide.classList.add('active');
    }
    
    // Activate current dot
    const currentDot = dots[slideIndex - 1];
    if (currentDot) {
        currentDot.classList.add('active');
    }
}

function nextSlide() {
    showSlides(slideIndex + 1);
}

function prevSlide() {
    showSlides(slideIndex - 1);
}

function currentSlide(n) {
    showSlides(n);
}

function startAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, SLIDER_INTERVAL);
}

function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

// -----------------------------
// Search & Filter (shop.html) - Combined
// -----------------------------
let searchTimeout = null;
let filterTimeout = null;

/**
 * Gets current filter values
 * @returns {Object} Object with searchTerm, category, and price filters
 */
function getFilterValues() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    
    return {
        searchTerm: (searchInput?.value || '').toLowerCase().trim(),
        category: categoryFilter?.value || 'all',
        price: priceFilter?.value || 'all'
    };
}

/**
 * Checks if product matches all active filters
 * @param {HTMLElement} product - Product card element
 * @param {Object} filters - Filter values
 * @returns {boolean} True if product matches filters
 */
function matchesFilters(product, filters) {
    // Search filter
    if (filters.searchTerm) {
        const titleEl = product.querySelector('h3');
        const productName = (titleEl?.textContent || '').toLowerCase();
        if (!productName.includes(filters.searchTerm)) {
            return false;
        }
    }

    // Category filter
    if (filters.category !== 'all') {
        const productCategory = product.getAttribute('data-category') || '';
        if (productCategory !== filters.category) {
            return false;
        }
    }

    // Price filter
    if (filters.price !== 'all') {
        const productPrice = parseFloat(product.getAttribute('data-price') || '0');
        const range = PRICE_RANGES[filters.price];
        if (range) {
            if (productPrice < range.min || productPrice > range.max) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Applies search and filter to product cards
 */
function applyFilters() {
    const products = document.querySelectorAll('.product-card');
    if (products.length === 0) return;

    const filters = getFilterValues();

    products.forEach(product => {
        const shouldShow = matchesFilters(product, filters);
        product.style.display = shouldShow ? '' : 'none';
    });
}

// Debounced versions
const debouncedSearch = debounce(applyFilters, SEARCH_DEBOUNCE_MS);
const debouncedFilter = debounce(applyFilters, FILTER_DEBOUNCE_MS);

function searchProducts() {
    debouncedSearch();
}

function filterProducts() {
    debouncedFilter();
}

/**
 * Applies URL category filter if present
 */
function applyUrlFilters() {
    try {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category');
        if (cat) {
            const catEl = document.getElementById('categoryFilter');
            if (catEl) {
                catEl.value = cat;
                applyFilters();
            }
        }
    } catch (e) {
        console.error('Failed to apply URL filters', e);
    }
}

// -----------------------------
// Add to cart + cart page functions
// -----------------------------
/**
 * Adds product to cart
 * @param {string} productName - Name of product
 * @param {number} price - Price of product
 */
function addToCart(productName, price) {
    if (!productName || typeof price !== 'number' || price < 0) {
        console.error('Invalid product data');
        return;
    }

    // Find product by name to ensure consistent info
    const productMeta = PRODUCTS.find(p => p.name === productName);
    const itemPrice = productMeta ? productMeta.price : parseFloat(price);

    if (isNaN(itemPrice) || itemPrice < 0) {
        console.error('Invalid price');
        return;
    }

    const existing = cart.find(item => item.name === productName);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ 
            name: productName, 
            price: itemPrice, 
            quantity: 1 
        });
    }

    saveCart();
    updateCartCount();
    
    // Show user-friendly notification
    showNotification(`${escapeHtml(productName)} added to cart!`);
}

/**
 * Shows a notification message (replaces alert)
 * @param {string} message - Message to display
 */
function showNotification(message) {
    // Try to find existing notification
    let notification = document.getElementById('cart-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'cart-notification';
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #27ae60; color: white; padding: 12px 20px; border-radius: 4px; z-index: 10000; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

/**
 * Updates the cart page DOM (cart.html)
 */
function updateCart() {
    const container = document.getElementById('cartItems');
    const emptyMsg = document.getElementById('emptyCartMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!container) return;

    container.innerHTML = '';

    if (!cart || cart.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        updateCartTotalsUI();
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'block';

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.setAttribute('data-cart-index', index);

        // Find product image
        const prod = PRODUCTS.find(p => p.name === item.name);
        const imgSrc = prod ? prod.img : `images/product${(index % 8) + 1}.jpg`;

        // Use textContent for safety, but we need innerHTML for structure
        // So we escape user content
        cartItem.innerHTML = `
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(item.name)}">
            <div class="cart-item-details">
                <div class="cart-item-title">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">${formatCurrency(item.price)}</div>
                <div class="cart-item-quantity">
                    <button class="qty-dec" data-index="${index}" aria-label="Decrease quantity">-</button>
                    <input type="number" class="qty-input" data-index="${index}" value="${item.quantity}" min="1" aria-label="Quantity">
                    <button class="qty-inc" data-index="${index}" aria-label="Increase quantity">+</button>
                    <button class="remove-item" data-index="${index}" aria-label="Remove item">Remove</button>
                </div>
            </div>
        `;
        fragment.appendChild(cartItem);
    });

    container.appendChild(fragment);
    updateCartTotalsUI();
}

/**
 * Updates totals on cart page (UI)
 */
function updateCartTotalsUI() {
    const totals = getCartTotals();
    const elements = {
        subtotal: document.getElementById('subtotal'),
        shipping: document.getElementById('shipping'),
        tax: document.getElementById('tax'),
        total: document.getElementById('total')
    };

    if (elements.subtotal) elements.subtotal.textContent = formatCurrency(totals.subtotal);
    if (elements.shipping) elements.shipping.textContent = formatCurrency(totals.shipping);
    if (elements.tax) elements.tax.textContent = formatCurrency(totals.tax);
    if (elements.total) elements.total.textContent = formatCurrency(totals.total);
}

/**
 * Updates item quantity in cart
 * @param {number} index - Cart item index
 * @param {number} newQuantity - New quantity (must be positive integer)
 */
function updateQuantity(index, newQuantity) {
    if (index < 0 || index >= cart.length) return;
    
    const quantity = Math.max(1, Math.floor(Number(newQuantity) || 1));
    
    if (quantity <= 0) {
        removeFromCart(index);
        return;
    }

    cart[index].quantity = quantity;
    saveCart();
    updateCartCount();
    updateCart();
}

/**
 * Adjusts quantity by a delta amount
 * @param {number} index - Cart item index
 * @param {number} delta - Change amount (-1, +1, etc.)
 */
function adjustQuantity(index, delta) {
    if (index < 0 || index >= cart.length) return;
    
    const newQuantity = cart[index].quantity + delta;
    updateQuantity(index, newQuantity);
}

/**
 * Removes item from cart by index
 * @param {number} index - Cart item index
 */
function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    updateCart();
}

/**
 * Handles cart item interactions using event delegation
 * @param {Event} event - Click or change event
 */
function handleCartInteraction(event) {
    const target = event.target;
    const index = parseInt(target.getAttribute('data-index'), 10);
    
    if (isNaN(index) || index < 0 || index >= cart.length) return;

    if (target.classList.contains('qty-dec')) {
        adjustQuantity(index, -1);
    } else if (target.classList.contains('qty-inc')) {
        adjustQuantity(index, 1);
    } else if (target.classList.contains('remove-item')) {
        if (confirm(`Remove ${escapeHtml(cart[index].name)} from cart?`)) {
            removeFromCart(index);
        }
    } else if (target.classList.contains('qty-input')) {
        const newQuantity = parseInt(target.value, 10);
        updateQuantity(index, newQuantity);
    }
}

// -----------------------------
// Checkout / Cart preview used on checkout.html
// -----------------------------
/**
 * Updates checkout summary
 */
function updateCheckoutSummary() {
    const subtotalEl = document.getElementById('subtotal');
    if (!subtotalEl) return;

    const totals = getCartTotals();
    const elements = {
        subtotal: document.getElementById('subtotal'),
        shipping: document.getElementById('shipping'),
        tax: document.getElementById('tax'),
        total: document.getElementById('total')
    };

    if (elements.subtotal) elements.subtotal.textContent = formatCurrency(totals.subtotal);
    if (elements.shipping) elements.shipping.textContent = formatCurrency(totals.shipping);
    if (elements.tax) elements.tax.textContent = formatCurrency(totals.tax);
    if (elements.total) elements.total.textContent = formatCurrency(totals.total);

    const cartPreview = document.getElementById('cartPreviewItems');
    if (cartPreview) {
        cartPreview.innerHTML = '';
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-title">${escapeHtml(item.name)}</div>
                <div class="cart-item-price">Qty: ${item.quantity} @ ${formatCurrency(item.price)}</div>
            `;
            cartPreview.appendChild(div);
        });
    }
}

// -----------------------------
// Forms Validation (contact + checkout)
// -----------------------------
/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Validates phone number format
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone.trim());
}

/**
 * Validates credit card number
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} True if valid
 */
function isValidCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    return /^[0-9]{13,19}$/.test(cleaned); // Support 13-19 digits (Visa, Mastercard, Amex, etc.)
}

/**
 * Validates expiry date (MM/YY format)
 * @param {string} expiryDate - Expiry date to validate
 * @returns {boolean} True if valid and not expired
 */
function isValidExpiryDate(expiryDate) {
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!expiryRegex.test(expiryDate)) return false;
    
    const [, month, year] = expiryDate.match(expiryRegex);
    const expiry = new Date(2000 + parseInt(year, 10), parseInt(month, 10) - 1);
    const now = new Date();
    return expiry > now;
}

/**
 * Validates CVV
 * @param {string} cvv - CVV to validate
 * @returns {boolean} True if valid
 */
function isValidCVV(cvv) {
    return /^[0-9]{3,4}$/.test(cvv);
}

/**
 * Gets form field value safely
 * @param {string} id - Field ID
 * @returns {string} Field value or empty string
 */
function getFieldValue(id) {
    const field = document.getElementById(id);
    return field ? (field.value || '').trim() : '';
}

/**
 * Validates contact form
 * @param {Event} event - Form submit event
 * @returns {boolean} False to prevent default submission
 */
function validateContactForm(event) {
    if (event) event.preventDefault();

    const name = getFieldValue('name');
    const email = getFieldValue('email');
    const subject = getFieldValue('subject');
    const message = getFieldValue('message');

    if (!name) {
        alert('Please enter your name');
        return false;
    }
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return false;
    }
    if (!subject) {
        alert('Please enter a subject');
        return false;
    }
    if (!message) {
        alert('Please enter your message');
        return false;
    }

    showNotification('Thank you for your message! We will get back to you soon.');
    const form = document.getElementById('contactForm');
    if (form) form.reset();
    return false;
}

/**
 * Validates checkout form
 * @param {Event} event - Form submit event
 * @returns {boolean} False to prevent default submission
 */
function validateCheckoutForm(event) {
    if (event) event.preventDefault();

    // Get all field values
    const fields = {
        firstName: getFieldValue('firstName'),
        lastName: getFieldValue('lastName'),
        email: getFieldValue('email'),
        phone: getFieldValue('phone'),
        address: getFieldValue('address'),
        city: getFieldValue('city'),
        state: getFieldValue('state'),
        zip: getFieldValue('zip'),
        cardName: getFieldValue('cardName'),
        cardNumber: getFieldValue('cardNumber'),
        expiryDate: getFieldValue('expiryDate'),
        cvv: getFieldValue('cvv')
    };

    // Check required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'cardName', 'cardNumber', 'expiryDate', 'cvv'];
    const missingFields = requiredFields.filter(field => !fields[field]);
    
    if (missingFields.length > 0) {
        alert('Please fill in all required fields');
        return false;
    }

    // Validate email
    if (!isValidEmail(fields.email)) {
        alert('Please enter a valid email address');
        return false;
    }

    // Validate phone
    if (!isValidPhone(fields.phone)) {
        alert('Please enter a valid phone number');
        return false;
    }

    // Validate card number
    if (!isValidCardNumber(fields.cardNumber)) {
        alert('Please enter a valid card number');
        return false;
    }

    // Validate expiry date
    if (!isValidExpiryDate(fields.expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY) that is not expired');
        return false;
    }

    // Validate CVV
    if (!isValidCVV(fields.cvv)) {
        alert('Please enter a valid CVV (3 or 4 digits)');
        return false;
    }

    // Check if cart is empty
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checkout.');
        return false;
    }

    showNotification('Order placed successfully! Thank you for shopping with UrbenShop.');

    // Clear cart after successful "order"
    cart = [];
    saveCart();
    updateCartCount();
    updateCart();
    updateCheckoutSummary();
    
    // Redirect to home page after a delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
    
    return false;
}

// -----------------------------
// Product page: load product by ?id=#
// -----------------------------
/**
 * Populates product page with product data
 */
function populateProductPage() {
    const nameEl = document.getElementById('productName');
    const priceEl = document.getElementById('productPrice');
    const descEl = document.getElementById('productDesc');
    const imgEl = document.getElementById('mainImage');

    if (!nameEl && !priceEl && !descEl && !imgEl) return;

    try {
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id'), 10);
        
        if (isNaN(id) || id < 1) {
            console.warn('Invalid product ID, using first product');
        }
        
        const product = PRODUCTS.find(prod => prod.id === id) || PRODUCTS[0];
        
        if (!product) {
            console.error('No product found');
            return;
        }

        if (nameEl) nameEl.textContent = product.name;
        if (priceEl) priceEl.textContent = formatCurrency(product.price);
        if (descEl) descEl.textContent = product.desc;
        if (imgEl) {
            imgEl.src = product.img;
            imgEl.alt = product.name;
        }

        // Update Add to Cart button
        const addBtn = document.querySelector('.product-info .add-to-cart-btn, .add-to-cart-btn');
        if (addBtn) {
            addBtn.onclick = (e) => {
                e.preventDefault();
                addToCart(product.name, product.price);
            };
        }
    } catch (e) {
        console.error('Failed to populate product page', e);
    }
}

// -----------------------------
// Mobile nav toggle
// -----------------------------
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// -----------------------------
// Initialization on DOMContentLoaded
// -----------------------------
document.addEventListener('DOMContentLoaded', function () {
    // Load cart from storage
    loadCart();

    // Setup slider if present
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        const activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
        slideIndex = activeIndex >= 0 ? activeIndex + 1 : 1;
        showSlides(slideIndex);
        startAutoSlide();
    }

    // Mobile menu
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Cart page setup with event delegation
    const cartContainer = document.getElementById('cartItems');
    if (cartContainer) {
        updateCart();
        // Use event delegation for cart interactions
        cartContainer.addEventListener('click', handleCartInteraction);
        cartContainer.addEventListener('change', handleCartInteraction);
    }

    // Checkout page setup
    if (document.getElementById('checkoutForm') || document.getElementById('cartPreviewItems')) {
        updateCheckoutSummary();
    }

    // Product page setup
    populateProductPage();

    // Search input with debouncing
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchProducts);
    }

    // Filter change handlers with debouncing
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    if (priceFilter) {
        priceFilter.addEventListener('change', filterProducts);
    }

    // Apply URL category filters if present
    applyUrlFilters();

    // Form validation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', validateContactForm);
    }

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', validateCheckoutForm);
    }

    // Slider hover pause
    const sliderEl = document.querySelector('.slider');
    if (sliderEl) {
        sliderEl.addEventListener('mouseenter', stopAutoSlide);
        sliderEl.addEventListener('mouseleave', startAutoSlide);
    }
});
