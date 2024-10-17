const productList = document.getElementById('productList');
const loadMoreButton = document.getElementById('loadMoreButton');
const shimmerContainer = document.getElementById('shimmerContainer');
const totalProductsCount = document.getElementById('totalProducts');
const sortSelect = document.getElementById('sort');
const searchInput = document.getElementById('searchInput');
const inStockCheckbox = document.getElementById('inStockCheckbox');
const categoryCheckboxes = document.querySelectorAll('.filter__category-checkbox');

let productData = [];
let currentProductCount = 0;
let filteredProducts = [];

// Fetch Products from API
async function fetchProducts() {
    showShimmer(); // Show shimmer while loading
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        productData = data;
        totalProductsCount.textContent = `${productData.length} Results`;
        loadProducts(); // Initial load
    } catch (error) {
        console.error('Error fetching products:', error);
        showError('Failed to load products. Please try again later.');
    } finally {
        hideShimmer(); // Hide shimmer after loading
    }
}

// Show shimmer
function showShimmer() {
    shimmerContainer.style.display = 'grid'; // Show shimmer cards
    productList.style.display = 'none'; // Hide products list while loading
}

// Hide shimmer
function hideShimmer() {
    shimmerContainer.style.display = 'none'; // Hide shimmer cards
    productList.style.display = 'grid'; // Show products list after loading
}

// Show error message
function showError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.classList.add('error-message');
    errorContainer.textContent = message;
    document.body.appendChild(errorContainer);
    setTimeout(() => {
        errorContainer.remove();
    }, 5000); // Remove error message after 5 seconds
}

// Load Products with filtering and sorting
function loadProducts() {
    filteredProducts = filterProducts(productData);
    const sortedProducts = sortProducts(filteredProducts);
    const productChunk = sortedProducts.slice(currentProductCount, currentProductCount + 10);

    // Clear product list before loading new products
    if (currentProductCount === 0) {
        productList.innerHTML = ''; // Clear previous products only on first load
    }

    // Check if there are products to display
    if (productChunk.length === 0) {
        loadMoreButton.style.display = 'none'; // Hide load more if no products
        return;
    }

    productChunk.forEach(product => {
        const productItem = document.createElement('div');
        productItem.classList.add('products__item');
        productItem.innerHTML = `
            <div class="product__image">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product__description">
                <p class="product_title">${product.title}</p>
                <p class="price">$${product.price}</p>
                <button class="products__like-button" aria-label="Like button">🤍</button>
            </div>`;

        const likeButton = productItem.querySelector('.products__like-button');
        likeButton.addEventListener('click', () => {
            if (likeButton.classList.toggle('liked')) {
                likeButton.innerHTML = '❤️'; // Change to filled heart
            } else {
                likeButton.innerHTML = '🤍'; // Change to hollow heart
            }
        });

        productList.appendChild(productItem);
    });

    currentProductCount += productChunk.length; // Increment by the number of loaded products

    // Hide Load More button if all products are loaded
    if (currentProductCount >= sortedProducts.length) {
        loadMoreButton.style.display = 'none'; // Hide button if no more products to load
    } else {
        loadMoreButton.style.display = 'block'; // Show Load More button if there are more products
    }
}

// Filter Products
function filterProducts(products) {
    const searchTerm = searchInput.value.toLowerCase();
    const showInStockOnly = inStockCheckbox.checked;

    // Get selected categories
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const filtered = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm);
        const matchesStock = showInStockOnly ? product.rating.count > 0 : true;
        const matchesCategory = selectedCategories.length > 0 ? selectedCategories.includes(product.category) : true; // If no category is selected, include all products

        return matchesSearch && matchesStock && matchesCategory;
    });

    totalProductsCount.textContent = `${filtered.length} Results`; // Update count

    // Reset current product count only when filtering products
    if (currentProductCount >= filtered.length) {
        currentProductCount = 0; // Reset count if filtered products are fewer than current count
    }

    return filtered; // Return the filtered products
}

// Sort Products
function sortProducts(products) {
    const sortValue = sortSelect.value;

    if (sortValue === 'price-asc') {
        return products.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
        return products.sort((a, b) => b.price - a.price);
    }

    return products;
}

// Event Listeners
loadMoreButton.addEventListener('click', loadProducts);

sortSelect.addEventListener('change', () => {
    currentProductCount = 0; // Reset count for sorting
    loadProducts(); // Reload products with sorting
});

searchInput.addEventListener('input', () => {
    currentProductCount = 0; // Reset count for new search
    loadProducts(); // Reload products with search input
});

inStockCheckbox.addEventListener('change', () => {
    currentProductCount = 0; // Reset count for in-stock filter
    loadProducts(); // Reload products with in-stock filter
});

// Add event listeners for category checkboxes
categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        currentProductCount = 0; // Reset count for category filter
        loadProducts(); // Reload products on category change
    });
});

// Initial Load
window.onload = fetchProducts;

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.header__nav');

    hamburger.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
});