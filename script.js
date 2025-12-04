let page = 1;
let loading = false;

// Correct Vercel Backend URL
const BACKEND_URL = "https://luxrymoll.vercel.app";

// small placeholder (optional) - use your own path if you have one
const PLACEHOLDER = "/placeholder.png";

function maybeAddPrefix(str) {
    if (!str) return "";
    const s = String(str).trim();

    // If it's already a data URI, return as-is
    if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(s)) return s;

    // Try to guess mime by looking for common headers in the base64 (very rough)
    // JPEG often starts with "/9j/" ; PNG often starts with "iVBOR"
    if (s.startsWith("/9j/") || s.startsWith("9j/")) {
        return `data:image/jpeg;base64,${s}`;
    }
    if (s.startsWith("iVBOR") || s.startsWith("iVBO")) {
        return `data:image/png;base64,${s}`;
    }

    // Fallback to jpeg
    return `data:image/jpeg;base64,${s}`;
}

async function loadProducts() {
    if (loading) return;
    loading = true;

    const loader = document.getElementById("loading");
    loader.style.display = "block";

    try {
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
            console.error("Invalid API response", products);
            loader.innerText = "No products found.";
            loading = false;
            return;
        }

        products.forEach(p => {
            const div = document.createElement("div");
            div.className = "product-card";

            // Robust image handling:
            // backend may send full data-uri or just raw base64; handle both.
            const raw = p.images?.[0] || "";
            const imgSrc = maybeAddPrefix(raw) || PLACEHOLDER;

            div.innerHTML = `
                <img src="${imgSrc}" alt="${(p.title||'Product').replace(/"/g,'')}" onerror="this.src='${PLACEHOLDER}'">
                <i class="fas fa-heart"></i>
                <h4>${p.title || ''}</h4>
                <p>
                    <del>₹${p.originalPrice ?? ''}</del>
                    <strong>₹${p.sellingPrice ?? ''}</strong>
                </p>
            `;

            div.onclick = () => { if (p._id) location.href = "/product/" + p._id; };

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
