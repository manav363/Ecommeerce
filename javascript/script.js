// ============================================
// PRODUCT DATA - All available products in the shop
// ============================================
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

// ============================================
// CART MANAGEMENT - Shopping cart functions
// ============================================
// Array to store items in the cart
let cart = [];

// Load cart from browser's localStorage (saves cart even after page refresh)
function loadCart() {
    try {
        const saved = localStorage.getItem('cart');
        cart = saved ? JSON.parse(saved) : [];
    } catch (e) {
        cart = [];
    }
    updateCartCount();
}

// Save cart to browser's localStorage (persists cart data)
function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {}
}

// Calculate total prices: subtotal, shipping, tax, and final total
function getCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 10 : 0; // $10 shipping if cart has items
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
}

// Update the cart count badge in the navigation bar
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const nav = document.querySelector('.nav-container');
    if (!nav) return;

    // Find or create the cart badge
    let badge = document.getElementById('cart-count-badge');
    if (!badge) {
        const cartLink = Array.from(nav.querySelectorAll('a')).find(a => a.getAttribute('href') === 'cart.html');
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

// Add a product to the cart
function addToCart(productName, price) {
    // Find product in PRODUCTS array to get correct price
    const product = PRODUCTS.find(p => p.name === productName);
    const itemPrice = product ? product.price : parseFloat(price);
    
    // Check if product already exists in cart
    const existing = cart.find(item => item.name === productName);
    if (existing) {
        existing.quantity += 1; // Increase quantity if already in cart
    } else {
        cart.push({ name: productName, price: itemPrice, quantity: 1 }); // Add new item
    }
    
    saveCart();
    updateCartCount();
    alert(`${productName} added to cart!`);
}

// Display all cart items on the cart page
function updateCart() {
    const container = document.getElementById('cartItems');
    const emptyMsg = document.getElementById('emptyCartMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Show empty message if cart is empty
    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        updateCartTotalsUI();
        return;
    }
    
    if (emptyMsg) emptyMsg.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'block';
    
    // Create HTML for each cart item
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        const product = PRODUCTS.find(p => p.name === item.name);
        const imgSrc = product ? product.img : `images/product${(index % 8) + 1}.jpg`;
        cartItem.innerHTML = `<img src="${imgSrc}" alt="${item.name}"><div class="cart-item-details"><div class="cart-item-title">${item.name}</div><div class="cart-item-price">$${item.price.toFixed(2)}</div><div class="cart-item-quantity"><button class="qty-dec" data-index="${index}">-</button><input type="number" class="qty-input" data-index="${index}" value="${item.quantity}" min="1"><button class="qty-inc" data-index="${index}">+</button><button class="remove-item" data-index="${index}">Remove</button></div></div>`;
        container.appendChild(cartItem);
    });
    
    // Add click handlers for decrease quantity button
    container.querySelectorAll('.qty-dec').forEach(btn => {
        btn.onclick = () => {
            const index = parseInt(btn.getAttribute('data-index'));
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1); // Remove item if quantity becomes 0
            }
            saveCart();
            updateCartCount();
            updateCart();
        };
    });
    
    // Add click handlers for increase quantity button
    container.querySelectorAll('.qty-inc').forEach(btn => {
        btn.onclick = () => {
            const index = parseInt(btn.getAttribute('data-index'));
            cart[index].quantity += 1;
            saveCart();
            updateCartCount();
            updateCart();
        };
    });
    
    // Add change handler for quantity input field
    container.querySelectorAll('.qty-input').forEach(input => {
        input.onchange = () => {
            const index = parseInt(input.getAttribute('data-index'));
            const quantity = parseInt(input.value) || 1;
            if (quantity > 0) {
                cart[index].quantity = quantity;
            } else {
                cart.splice(index, 1); // Remove if quantity is 0 or less
            }
            saveCart();
            updateCartCount();
            updateCart();
        };
    });
    
    // Add click handlers for remove button
    container.querySelectorAll('.remove-item').forEach(btn => {
        btn.onclick = () => {
            const index = parseInt(btn.getAttribute('data-index'));
            cart.splice(index, 1);
            saveCart();
            updateCartCount();
            updateCart();
        };
    });
    
    updateCartTotalsUI();
}

// Update the totals display (subtotal, shipping, tax, total)
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

// ============================================
// SLIDER FUNCTIONS - Image carousel on homepage
// ============================================
let slideIndex = 1; // Current slide number (starts at 1)
let slideInterval = null; // Stores the auto-slide interval

// Show a specific slide by number
function showSlides(n) {
    const slides = document.getElementsByClassName('slide');
    const dots = document.getElementsByClassName('dot');
    if (!slides || slides.length === 0) return;

    // Wrap around: if n is too high, go to first slide; if too low, go to last slide
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    else slideIndex = n;

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.opacity = '0';
        slides[i].classList.remove('active');
    }
    
    // Remove active class from all dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active');
    }

    // Show the current slide and activate its dot
    slides[slideIndex - 1].style.opacity = '1';
    slides[slideIndex - 1].classList.add('active');
    if (dots[slideIndex - 1]) dots[slideIndex - 1].classList.add('active');
}

// Go to next slide
function nextSlide() {
    showSlides(slideIndex + 1);
}

// Go to previous slide
function prevSlide() {
    showSlides(slideIndex - 1);
}

// Jump to a specific slide
function currentSlide(n) {
    showSlides(n);
}

// Start automatic sliding (changes slide every 5 seconds)
function startAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
}

// Stop automatic sliding
function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

// ============================================
// SEARCH & FILTER FUNCTIONS - Shop page features
// ============================================
let searchTimeout = null; // Used for debouncing search input

// Search products by name (filters products as user types)
function searchProducts() {
    const input = document.getElementById('searchInput');
    const searchTerm = input ? input.value.toLowerCase() : '';
    const products = document.querySelectorAll('.product-card');

    // Show/hide products based on search term
    products.forEach(product => {
        const titleEl = product.querySelector('h3');
        const productName = titleEl ? titleEl.textContent.toLowerCase() : '';
        product.style.display = productName.includes(searchTerm) ? '' : 'none';
    });
}

// Filter products by category and price range
function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const category = categoryFilter ? categoryFilter.value : 'all';
    const price = priceFilter ? priceFilter.value : 'all';
    const products = document.querySelectorAll('.product-card');

    products.forEach(product => {
        const productCategory = product.getAttribute('data-category') || '';
        const productPrice = parseFloat(product.getAttribute('data-price') || '0');
        let showProduct = true;
        
        // Check category filter
        if (category !== 'all' && productCategory !== category) showProduct = false;
        
        // Check price filter (low: <$100, medium: $100-$300, high: >$300)
        if (price !== 'all') {
            if (price === 'low' && productPrice >= 100) showProduct = false;
            else if (price === 'medium' && (productPrice < 100 || productPrice > 300)) showProduct = false;
            else if (price === 'high' && productPrice <= 300) showProduct = false;
        }

        product.style.display = showProduct ? '' : 'none';
    });
}

// Apply category filter from URL parameter (e.g., ?category=watches)
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
    } catch (e) {}
}

// ============================================
// CHECKOUT FUNCTIONS - Order summary display
// ============================================
// Update the checkout page summary with cart totals and items
function updateCheckoutSummary() {
    const subtotalEl = document.getElementById('subtotal');
    if (!subtotalEl) return;

    const totals = getCartTotals();
    document.getElementById('subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${totals.shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${totals.tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${totals.total.toFixed(2)}`;

    // Display cart items preview
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

// ============================================
// FORM VALIDATION - Contact and checkout forms
// ============================================
// Validate contact form before submission
function validateContactForm(event) {
    if (event) event.preventDefault();

    // Get form values
    const name = document.getElementById('name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const subject = document.getElementById('subject')?.value.trim() || '';
    const message = document.getElementById('message')?.value.trim() || '';
    
    // Validate each field
    if (!name) {
        alert('Please enter your name');
        return false;
    }
    if (!email || !email.includes('@')) {
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

    alert('Thank you for your message! We will get back to you soon.');
    document.getElementById('contactForm')?.reset();
    return false;
}

// Validate checkout form before submission
function validateCheckoutForm(event) {
    if (event) event.preventDefault();

    // Get all form field values
    const firstName = document.getElementById('firstName')?.value.trim() || '';
    const lastName = document.getElementById('lastName')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const address = document.getElementById('address')?.value.trim() || '';
    const city = document.getElementById('city')?.value.trim() || '';
    const state = document.getElementById('state')?.value.trim() || '';
    const zip = document.getElementById('zip')?.value.trim() || '';
    const cardName = document.getElementById('cardName')?.value.trim() || '';
    const cardNumber = document.getElementById('cardNumber')?.value.trim() || '';
    const expiryDate = document.getElementById('expiryDate')?.value.trim() || '';
    const cvv = document.getElementById('cvv')?.value.trim() || '';
    
    // Check all required fields are filled
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zip || !cardName || !cardNumber || !expiryDate || !cvv) {
        alert('Please fill in all required fields');
        return false;
    }

    // Validate email format
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return false;
    }
    
    // Validate phone number (must have at least 10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        alert('Please enter a valid phone number');
        return false;
    }
    
    // Validate card number (13-19 digits)
    const cardDigits = cardNumber.replace(/\s/g, '');
    if (cardDigits.length < 13 || cardDigits.length > 19) {
        alert('Please enter a valid card number');
        return false;
    }
    
    // Validate expiry date format (MM/YY)
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY)');
        return false;
    }
    
    // Validate CVV (3 or 4 digits)
    if (!/^[0-9]{3,4}$/.test(cvv)) {
        alert('Please enter a valid CVV (3 or 4 digits)');
        return false;
    }
    
    // Check if cart is empty
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checkout.');
        return false;
    }
    
    // Order successful - clear cart and redirect
    alert('Order placed successfully! Thank you for shopping with UrbenShop.');
    cart = [];
    saveCart();
    updateCartCount();
    updateCart();
    updateCheckoutSummary();
    
    // Redirect to home page after 2 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
    
    return false;
}

// ============================================
// PRODUCT PAGE - Display individual product details
// ============================================
// Load and display product information on product detail page
function populateProductPage() {
    const nameEl = document.getElementById('productName');
    const priceEl = document.getElementById('productPrice');
    const descEl = document.getElementById('productDesc');
    const imgEl = document.getElementById('mainImage');
    if (!nameEl && !priceEl && !descEl && !imgEl) return;

    try {
        // Get product ID from URL (e.g., ?id=1)
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id')) || 1;
        const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
        
        // Update page elements with product data
        if (nameEl) nameEl.textContent = product.name;
        if (priceEl) priceEl.textContent = `$${product.price.toFixed(2)}`;
        if (descEl) descEl.textContent = product.desc;
        if (imgEl) {
            imgEl.src = product.img;
            imgEl.alt = product.name;
        }
        
        // Connect "Add to Cart" button
        const addBtn = document.querySelector('.add-to-cart-btn');
        if (addBtn) {
            addBtn.onclick = () => addToCart(product.name, product.price);
        }
    } catch (e) {}
}

// ============================================
// MOBILE MENU - Toggle mobile navigation
// ============================================
// Toggle mobile menu open/closed
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) navMenu.classList.toggle('active');
}

// ============================================
// INITIALIZATION - Run when page loads
// ============================================
// Initialize all features when the page finishes loading
document.addEventListener('DOMContentLoaded', function () {
    // Load saved cart from localStorage
    loadCart();

    // Initialize slider if slides exist on page
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        const activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
        slideIndex = activeIndex >= 0 ? activeIndex + 1 : 1;
        showSlides(slideIndex);
        startAutoSlide(); // Start auto-sliding
    }

    // Setup mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Initialize cart page if on cart page
    if (document.getElementById('cartItems')) {
        updateCart();
    }

    // Initialize checkout page if on checkout page
    if (document.getElementById('checkoutForm') || document.getElementById('cartPreviewItems')) {
        updateCheckoutSummary();
    }

    // Initialize product page if on product page
    populateProductPage();

    // Setup search with debounce (waits 300ms after user stops typing)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(searchProducts, 300);
        });
    }

    // Setup filter dropdowns
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
    if (priceFilter) priceFilter.addEventListener('change', filterProducts);

    // Apply filters from URL if present
    applyUrlFilters();

    // Setup form validation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', validateContactForm);

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) checkoutForm.addEventListener('submit', validateCheckoutForm);

    // Pause slider when user hovers over it
    const sliderEl = document.querySelector('.slider');
    if (sliderEl) {
        sliderEl.addEventListener('mouseenter', stopAutoSlide);
        sliderEl.addEventListener('mouseleave', startAutoSlide);
    }
});
