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

// -----------------------------
// Cart (in-memory + localStorage)
// -----------------------------
let cart = [];

// read cart from localStorage
function loadCart() {
    try {
        const saved = localStorage.getItem('cart');
        cart = saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Failed to load cart from localStorage', e);
        cart = [];
    }
    updateCartCount();
}

// write cart to localStorage
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Failed to save cart to localStorage', e);
    }
}

// returns totals object
function getCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 0 ? 10 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
}

// Updates visual cart count in nav - creates badge if needed
function updateCartCount() {
    const count = cart.reduce((t, it) => t + it.quantity, 0);

    // try to find an existing badge
    let nav = document.querySelector('.nav-container');
    if (!nav) return; // nav not present on this page

    let badge = document.getElementById('cart-count-badge');
    if (!badge) {
        // create a small badge next to the Cart link
        const cartLink = Array.from(nav.querySelectorAll('a')).find(a => a.getAttribute('href') === 'cart.html');
        if (cartLink) {
            badge = document.createElement('span');
            badge.id = 'cart-count-badge';
            badge.style.background = '#e74c3c';
            badge.style.color = 'white';
            badge.style.padding = '2px 6px';
            badge.style.borderRadius = '12px';
            badge.style.fontSize = '12px';
            badge.style.marginLeft = '8px';
            badge.style.verticalAlign = 'middle';
            cartLink.parentNode.insertBefore(badge, cartLink.nextSibling);
        }
    }
    if (badge) badge.textContent = count;
}

// -----------------------------
// Slider (index.html)
// -----------------------------
let slideIndex = 1;
let slideInterval = null;

function showSlides(n) {
    const slides = document.getElementsByClassName('slide');
    const dots = document.getElementsByClassName('dot');
    if (!slides || slides.length === 0) return;

    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.opacity = '0';
        slides[i].classList.remove('active');
    }
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(' active', '');
    }

    slides[slideIndex - 1].style.opacity = '1';
    slides[slideIndex - 1].classList.add('active');
    if (dots[slideIndex - 1]) dots[slideIndex - 1].className += ' active';
}

function nextSlide() {
    showSlides(++slideIndex);
}
function prevSlide() {
    showSlides(--slideIndex);
}
function currentSlide(n) {
    slideIndex = n;
    showSlides(slideIndex);
}
function startAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}
function stopAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
}

// -----------------------------
// Search & Filter (shop.html)
// -----------------------------
let searchTimeout = null;

function searchProducts() {
    const input = document.getElementById('searchInput');
    const searchTerm = input ? input.value.toLowerCase() : '';
    const products = document.querySelectorAll('.product-card');

    products.forEach(product => {
        const titleEl = product.querySelector('h3');
        const productName = titleEl ? titleEl.textContent.toLowerCase() : '';
        if (productName.includes(searchTerm)) {
            product.style.display = '';
        } else {
            product.style.display = 'none';
        }
    });
}

function filterProducts() {
    const categoryFilterEl = document.getElementById('categoryFilter');
    const priceFilterEl = document.getElementById('priceFilter');
    const categoryFilter = categoryFilterEl ? categoryFilterEl.value : 'all';
    const priceFilter = priceFilterEl ? priceFilterEl.value : 'all';
    const products = document.querySelectorAll('.product-card');

    products.forEach(product => {
        const productCategory = product.getAttribute('data-category') || '';
        const productPrice = parseFloat(product.getAttribute('data-price') || '0');

        let showProduct = true;
        if (categoryFilter !== 'all' && productCategory !== categoryFilter) showProduct = false;

        if (priceFilter !== 'all') {
            if (priceFilter === 'low' && productPrice >= 100) showProduct = false;
            else if (priceFilter === 'medium' && (productPrice < 100 || productPrice > 300)) showProduct = false;
            else if (priceFilter === 'high' && productPrice <= 300) showProduct = false;
        }

        product.style.display = showProduct ? '' : 'none';
    });
}

// if shop.html has URL category param, apply it
function applyUrlFilters() {
    try {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category');
        if (cat) {
            const catEl = document.getElementById('categoryFilter');
            if (catEl) {
                catEl.value = cat;
                filterProducts();
            }
        }
    } catch (e) {
        // ignore
    }
}

// -----------------------------
// Add to cart + cart page functions
// -----------------------------
function addToCart(productName, price) {
    // find product by name if possible (ensures consistent info)
    const productMeta = PRODUCTS.find(p => p.name === productName);
    const itemPrice = productMeta ? productMeta.price : parseFloat(price);

    const existing = cart.find(item => item.name === productName);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name: productName, price: itemPrice, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    // Friendly confirmation
    alert(`${productName} added to cart!`);
}

// update the cart page DOM (cart.html)
function updateCart() {
    const container = document.getElementById('cartItems');
    const emptyMsg = document.getElementById('emptyCartMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!container) return; // not a cart page

    // clear existing
    container.innerHTML = '';

    if (!cart || cart.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        updateCartTotalsUI(); // still show $0.00
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'block';

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        // image fallback: try to find product image by name
        const prod = PRODUCTS.find(p => p.name === item.name);
        const imgSrc = prod ? prod.img : `images/product${(index % 8) + 1}.jpg`;

        cartItem.innerHTML = `
            <img src="${imgSrc}" alt="${item.name}">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${Number(item.price).toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="qty-dec" data-index="${index}">-</button>
                    <input type="number" class="qty-input" data-index="${index}" value="${item.quantity}" min="1">
                    <button class="qty-inc" data-index="${index}">+</button>
                    <button class="remove-item" data-index="${index}">Remove</button>
                </div>
            </div>
        `;
        container.appendChild(cartItem);
    });

    // attach event listeners to newly created controls
    container.querySelectorAll('.qty-dec').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.getAttribute('data-index'));
            updateQuantity(idx, -1);
        });
    });
    container.querySelectorAll('.qty-inc').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.getAttribute('data-index'));
            updateQuantity(idx, 1);
        });
    });
    container.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', () => {
            const idx = Number(input.getAttribute('data-index'));
            const val = parseInt(input.value) || 1;
            updateQuantity(idx, 0, val);
        });
    });
    container.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.getAttribute('data-index'));
            removeFromCart(idx);
        });
    });

    updateCartTotalsUI();
}

// update totals on cart page (UI)
function updateCartTotalsUI() {
    const totals = getCartTotals();
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `$${totals.shipping.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${totals.tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${totals.total.toFixed(2)}`;
}

// update quantity: change can be -1, +1, or 0 with newQuantity
function updateQuantity(index, change = 0, newQuantity) {
    if (!cart[index]) return;
    if (change === 0 && typeof newQuantity !== 'undefined') {
        cart[index].quantity = Number(newQuantity);
    } else {
        cart[index].quantity = (cart[index].quantity || 0) + change;
    }

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    updateCartCount();
    updateCart(); // re-render
}

// remove item by index
function removeFromCart(index) {
    if (!cart[index]) return;
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    updateCart();
}

// -----------------------------
// Checkout / Cart preview used on checkout.html
// -----------------------------
function updateCheckoutSummary() {
    // if checkout page not present, skip
    const subtotalEl = document.getElementById('subtotal');
    if (!subtotalEl) return;

    const totals = getCartTotals();
    document.getElementById('subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${totals.shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${totals.tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${totals.total.toFixed(2)}`;

    const cartPreview = document.getElementById('cartPreviewItems');
    if (cartPreview) {
        cartPreview.innerHTML = '';
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `<div class="cart-item-title">${item.name}</div><div class="cart-item-price">Qty: ${item.quantity} @ $${item.price.toFixed(2)}</div>`;
            cartPreview.appendChild(div);
        });
    }
}

// -----------------------------
// Forms Validation (contact + checkout)
// -----------------------------
function validateContactForm(event) {
    if (event) event.preventDefault();

    const name = (document.getElementById('name') || {}).value || '';
    const email = (document.getElementById('email') || {}).value || '';
    const subject = (document.getElementById('subject') || {}).value || '';
    const message = (document.getElementById('message') || {}).value || '';

    if (name.trim() === '') { alert('Please enter your name'); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { alert('Please enter a valid email address'); return false; }
    if (subject.trim() === '') { alert('Please enter a subject'); return false; }
    if (message.trim() === '') { alert('Please enter your message'); return false; }

    alert('Thank you for your message! We will get back to you soon.');
    const form = document.getElementById('contactForm');
    if (form) form.reset();
    return false;
}

function validateCheckoutForm(event) {
    if (event) event.preventDefault();

    const firstName = (document.getElementById('firstName') || {}).value || '';
    const lastName = (document.getElementById('lastName') || {}).value || '';
    const email = (document.getElementById('email') || {}).value || '';
    const phone = (document.getElementById('phone') || {}).value || '';
    const address = (document.getElementById('address') || {}).value || '';
    const city = (document.getElementById('city') || {}).value || '';
    const state = (document.getElementById('state') || {}).value || '';
    const zip = (document.getElementById('zip') || {}).value || '';
    const cardName = (document.getElementById('cardName') || {}).value || '';
    const cardNumber = (document.getElementById('cardNumber') || {}).value || '';
    const expiryDate = (document.getElementById('expiryDate') || {}).value || '';
    const cvv = (document.getElementById('cvv') || {}).value || '';

    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zip ||
        !cardName || !cardNumber || !expiryDate || !cvv) {
        alert('Please fill in all required fields');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { alert('Please enter a valid email address'); return false; }

    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(phone)) { alert('Please enter a valid phone number'); return false; }

    const cardNumberRegex = /^[0-9]{16}$/;
    if (!cardNumberRegex.test(cardNumber.replace(/\s/g, ''))) { alert('Please enter a valid 16-digit card number'); return false; }

    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!expiryRegex.test(expiryDate)) { alert('Please enter a valid expiry date (MM/YY)'); return false; }

    const cvvRegex = /^[0-9]{3,4}$/;
    if (!cvvRegex.test(cvv)) { alert('Please enter a valid CVV (3 or 4 digits)'); return false; }

    alert('Order placed successfully! Thank you for shopping with UrbenShop.');

    // Clear cart after successful "order"
    cart = [];
    saveCart();
    updateCartCount();
    updateCart();
    updateCheckoutSummary();
    return false;
}

// -----------------------------
// Product page: load product by ?id=#
// -----------------------------
function populateProductPage() {
    const nameEl = document.getElementById('productName');
    const priceEl = document.getElementById('productPrice');
    const descEl = document.getElementById('productDesc');
    const imgEl = document.getElementById('mainImage');

    if (!nameEl && !priceEl && !descEl && !imgEl) return; // not a product page

    try {
        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get('id') || 1);
        const p = PRODUCTS.find(prod => prod.id === id) || PRODUCTS[0];

        if (nameEl) nameEl.textContent = p.name;
        if (priceEl) priceEl.textContent = `$${p.price.toFixed(2)}`;
        if (descEl) descEl.textContent = p.desc;
        if (imgEl) imgEl.src = p.img;

        // update Add to Cart button if present
        const addBtn = Array.from(document.getElementsByClassName('add-to-cart-btn')).find(b => b.closest && b.closest('.product-info'));
        if (addBtn) {
            addBtn.onclick = () => addToCart(p.name, p.price);
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
    if (navMenu) navMenu.classList.toggle('active');
}

// -----------------------------
// Initialization on DOMContentLoaded
// -----------------------------
document.addEventListener('DOMContentLoaded', function () {
    // Load cart from storage and reflect cart count everywhere
    loadCart();

    // Setup slider if present
    if (document.querySelectorAll('.slide').length > 0) {
        // find first active slide or default to 1
        const activeIndex = Array.from(document.querySelectorAll('.slide')).findIndex(s => s.classList.contains('active'));
        slideIndex = activeIndex >= 0 ? activeIndex + 1 : 1;
        showSlides(slideIndex);
        startAutoSlide();
    }

    // Mobile menu
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // If on cart page, render cart
    if (document.getElementById('cartItems')) {
        updateCart(); // reads `cart`
    }

    // If on checkout page, update summary
    if (document.getElementById('checkoutForm') || document.getElementById('cartPreviewItems')) {
        updateCheckoutSummary();
    }

    // If on product page, populate from PRODUCTS using id param
    populateProductPage();

    // Search input debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(searchProducts, 300);
        });
    }

    // Watch filters change
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
    if (priceFilter) priceFilter.addEventListener('change', filterProducts);

    // Apply URL category filters if present on shop page
    applyUrlFilters();

    // Attach contact form validation if present
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', validateContactForm);

    // Attach checkout validation if present
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) checkoutForm.addEventListener('submit', validateCheckoutForm);

    // Stop auto sliding when user hovers slider, restart when leaves
    const sliderEl = document.querySelector('.slider');
    if (sliderEl) {
        sliderEl.addEventListener('mouseenter', stopAutoSlide);
        sliderEl.addEventListener('mouseleave', startAutoSlide);
    }
});
