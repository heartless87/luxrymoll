let page = 1;
let loading = false;

const BACKEND_URL = "https://luxrymoll.vercel.app";
const PLACEHOLDER = "/placeholder.png";

/* Detect raw base64 or full data URI */
function convertImg(str) {
    if (!str) return "";

    const s = String(str).trim();

    // Already full data URI
    if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(s)) return s;

    // Guess mime
    if (s.startsWith("/9j/")) return `data:image/jpeg;base64,${s}`;
    if (s.startsWith("iVBOR")) return `data:image/png;base64,${s}`;

    // Default jpeg
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
            loader.innerText = "Failed to load products!";
            loading = false;
            return;
        }

        const products = await res.json();
        const container = document.getElementById("products-container");

        products.forEach(p => {
            const rawImg = p.images?.[0] || "";
            const imgSrc = convertImg(rawImg) || PLACEHOLDER;

            const div = document.createElement("div");
            div.className = "product-card";

            // ⭐ Updated HTML (image wrapper + heart icon)
            div.innerHTML = `
                <div class="image-wrapper">
                    <img src="${imgSrc}" alt="${p.title}">
                    <i class="fas fa-heart heart-icon"></i>
                </div>

                <h4 class="product-title">${p.title}</h4>

                <div class="price-row">
                    <span class="orig-price">₹${p.originalPrice}</span>
                    <span class="sell-price">₹${p.sellingPrice}</span>
                </div>
            `;

            div.onclick = () => location.href = "/product/" + p._id;
            container.appendChild(div);
        });

        page++;
        loading = false;

        if (products.length < 12) {
            loader.innerText = "No more products";
        }

    } catch (err) {
        console.error("Fetch Error:", err);
        loader.innerText = "Error loading products.";
        loading = false;
    }
}

window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 900) {
        loadProducts();
    }
});

// Load first page
loadProducts();
