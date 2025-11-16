// UrbenShop - JavaScript functionality
// Contains all required JavaScript features: Add to Cart, Search/Filter, Image Slider, Form Validation

// Initialize cart array to store added products
let cart = [];

// Image slider functionality for home page
let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function nextSlide() {
    showSlides(slideIndex += 1);
}

function prevSlide() {
    showSlides(slideIndex -= 1);
}

// Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    
    for (i = 0; i < slides.length; i++) {
        slides[i].style.opacity = "0";
    }
    
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    // Use fade effect
    slides[slideIndex-1].style.opacity = "1";
    if (dots[slideIndex-1]) {
        dots[slideIndex-1].className += " active";
    }
}

// Auto slide every 5 seconds
setInterval(() => {
    nextSlide();
}, 5000);

// Add to Cart functionality
function addToCart(productName, price) {
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        // If exists, increase quantity
        existingItem.quantity += 1;
    } else {
        // If not, add new item to cart
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    // Show confirmation
    alert(`${productName} added to cart!`);
    
    // Update cart count in navigation (if needed)
    updateCartCount();
}

// Update cart count in navigation
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    // In a real implementation, we would update a cart icon/counter in the navigation
    console.log(`Items in cart: ${cartCount}`);
}

// Search products functionality
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const productName = product.querySelector('h3').textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Filter products by category or price
function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const productCategory = product.getAttribute('data-category');
        const productPrice = parseFloat(product.getAttribute('data-price'));
        
        let showProduct = true;
        
        // Filter by category
        if (categoryFilter !== 'all' && productCategory !== categoryFilter) {
            showProduct = false;
        }
        
        // Filter by price
        if (priceFilter !== 'all') {
            if (priceFilter === 'low' && productPrice >= 100) {
                showProduct = false;
            } else if (priceFilter === 'medium' && (productPrice < 100 || productPrice > 300)) {
                showProduct = false;
            } else if (priceFilter === 'high' && productPrice <= 300) {
                showProduct = false;
            }
        }
        
        if (showProduct) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Function to update cart page
function updateCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Clear previous items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        checkoutBtn.style.display = 'none';
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    checkoutBtn.style.display = 'block';
    
    // Add cart items to page
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="images/product${index % 8 + 1}.jpg" alt="${item.name}">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, 0, this.value)" readonly>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Update totals
    updateCartTotals();
}

// Update cart totals
function updateCartTotals() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 10 : 0; // $10 shipping if there are items
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Update item quantity in cart
function updateQuantity(index, change, newQuantity) {
    if (change === 0) {
        // Direct quantity update
        cart[index].quantity = parseInt(newQuantity);
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
    } else {
        // Quantity change by increment/decrement
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
    }
    
    updateCart();
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Load cart from localStorage if available
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCart();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Contact form validation
function validateContactForm(event) {
    event.preventDefault(); // Prevent form from submitting normally
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Validate name
    if (name === '') {
        alert('Please enter your name');
        return false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return false;
    }
    
    // Validate subject
    if (subject === '') {
        alert('Please enter a subject');
        return false;
    }
    
    // Validate message
    if (message === '') {
        alert('Please enter your message');
        return false;
    }
    
    // If all validations pass, show success message
    alert('Thank you for your message! We will get back to you soon.');
    document.getElementById('contactForm').reset();
    return false; // Prevent actual form submission since this is a demo
}

// Checkout form validation
function validateCheckoutForm(event) {
    event.preventDefault(); // Prevent form from submitting normally
    
    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zip = document.getElementById('zip').value.trim();
    const cardName = document.getElementById('cardName').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiryDate = document.getElementById('expiryDate').value.trim();
    const cvv = document.getElementById('cvv').value.trim();
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zip || 
        !cardName || !cardNumber || !expiryDate || !cvv) {
        alert('Please fill in all required fields');
        return false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return false;
    }
    
    // Validate phone (simple validation)
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phoneRegex.test(phone)) {
        alert('Please enter a valid phone number');
        return false;
    }
    
    // Validate card number (simple validation - 16 digits)
    const cardNumberRegex = /^[0-9]{16}$/;
    if (!cardNumberRegex.test(cardNumber.replace(/\s/g, ''))) {
        alert('Please enter a valid 16-digit card number');
        return false;
    }
    
    // Validate expiry date (MM/YY format)
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!expiryRegex.test(expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY)');
        return false;
    }
    
    // Validate CVV (3 or 4 digits)
    const cvvRegex = /^[0-9]{3,4}$/;
    if (!cvvRegex.test(cvv)) {
        alert('Please enter a valid CVV (3 or 4 digits)');
        return false;
    }
    
    // If all validations pass, show success message
    alert('Order placed successfully! Thank you for shopping with UrbenShop.');
    
    // In a real implementation, we would submit the form
    // document.getElementById('checkoutForm').submit();
    return false; // Prevent actual form submission since this is a demo
}

// Update checkout summary when page loads
function updateCheckoutSummary() {
    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 10 : 0; // $10 shipping if there are items
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    // Update totals on page
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    // Populate cart preview
    const cartPreview = document.getElementById('cartPreviewItems');
    cartPreview.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">Qty: ${item.quantity} @ $${item.price.toFixed(2)}</div>
        `;
        cartPreview.appendChild(cartItem);
    });
}

// Mobile navigation toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Initialize cart if we're on a cart page
    if (document.getElementById('cartItems')) {
        loadCart();
        updateCart();
    }
    
    // Update checkout summary if we're on checkout page
    if (document.getElementById('checkoutForm')) {
        updateCheckoutSummary();
    }
    
    // Update search input as user types
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const searchTimeout = setTimeout(searchProducts, 300);
        });
    }
});

