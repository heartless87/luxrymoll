let page = 1;
let isLoading = false;
const container = document.getElementById("products-container");
const loading = document.getElementById("loading");

async function loadProducts() {
    if (isLoading) return;
    isLoading = true;
    loading.style.display = "block";

    try {
        const res = await fetch(`/api/products?page=${page}`);
        const data = await res.json();

        if (data.length === 0) {
            loading.innerText = "No more products";
            return;
        }

        data.forEach(product => {
            container.appendChild(createProductCard(product));
        });

        page++;
    } catch (err) {
        console.log("Error loading products:", err);
    }

    loading.style.display = "none";
    isLoading = false;
}

// PRODUCT CARD UI
function createProductCard(p) {

    // base64 cleaning → remove everything before "base64,"
    const cleanBase64 = p.image1.split("base64,")[1];

    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
        <img src="data:image/png;base64,${cleanBase64}" alt="${p.title}">
        
        <h4 class="product-title">${p.title}</h4>

        <div class="prices">
            <span class="orig-price">₹${p.originalPrice}</span>
            <span class="sell-price">₹${p.sellingPrice}</span>
        </div>
    `;

    return card;
}


// Infinite Scroll Trigger
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        loadProducts();
    }
});

// Initially load first data
loadProducts();
