let page = 1;
let loading = false;

// Correct Vercel Backend URL
const BACKEND_URL = "https://luxrymoll.vercel.app";

async function loadProducts() {
    if (loading) return;
    loading = true;

    const loader = document.getElementById("loading");
    loader.style.display = "block";

    try {
        // ⭐ Correct API → getProducts
        const res = await fetch(`${BACKEND_URL}/api/getProducts?page=${page}`);

        if (!res.ok) {
            console.error("API Error:", res.status, res.statusText);
            loader.innerText = "Failed to load products!";
            loading = false;
            return;
        }

        const products = await res.json();
        const container = document.getElementById("products-container");

        if (!Array.isArray(products)) {
            console.error("Invalid API response");
            loader.innerText = "No products found.";
            loading = false;
            return;
        }

        products.forEach(p => {
            const div = document.createElement("div");
            div.className = "product-card";

            // ⭐ BASE64 FIX
            const imgSrc = p.images?.[0]
                ? `data:image/jpeg;base64,${p.images[0]}`
                : "";

            div.innerHTML = `
                <img src="${imgSrc}" alt="${p.title}">
                <i class="fas fa-heart"></i>
                <h4>${p.title}</h4>
                <p>
                    <del>₹${p.originalPrice}</del>
                    <strong>₹${p.sellingPrice}</strong>
                </p>
            `;

            div.onclick = () => location.href = "/product/" + p._id;

            container.appendChild(div);
        });

        page++;
        loading = false;

        if (products.length < 12) {
            loader.innerText = "No more products";
        } else {
            loader.style.display = "block";
        }
    }

    catch (err) {
        console.error("Fetch Error:", err);
        loader.innerText = "Error loading products.";
        loading = false;
    }
}

// Infinite Scroll Trigger
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 900) {
        loadProducts();
    }
});

// Load first page on start
loadProducts();
