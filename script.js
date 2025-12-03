let page = 1;
let loading = false;

// Vercel backend URL
const BACKEND_URL = "https://luxrymoll.vercel.app";

function loadProducts() {
    if (loading) return;
    loading = true;

    document.getElementById('loading').style.display = 'block';

    // FIXED → Correct API endpoint (Product.js)
    fetch(`${BACKEND_URL}/api/Product?page=${page}`)
        .then(res => res.json())
        .then(products => {
            const container = document.getElementById('products-container');

            products.forEach(p => {
                const div = document.createElement('div');
                div.className = 'product-card';

                // FIXED → Base64 image with prefix
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

                div.onclick = () => location.href = `/product/${p._id}`;
                container.appendChild(div);
            });

            page++;
            loading = false;

            if (products.length < 12) {
                document.getElementById('loading').innerText = "No more products";
            } else {
                document.getElementById('loading').style.display = 'block';
            }
        })
        .catch(err => {
            console.error("Fetch Error:", err);
            loading = false;
        });
}

// Infinite Scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 900) {
        loadProducts();
    }
});

// First load
loadProducts();
