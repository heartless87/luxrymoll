let page = 1;
let loading = false;

// 🔥 Replace this with your real Vercel backend URL
const BACKEND_URL = "https://luxrymoll.vercel.app";

function loadProducts() {
    if (loading) return;
    loading = true;
    document.getElementById('loading').style.display = 'block';

    fetch(`${BACKEND_URL}/api/products?page=${page}`)
        .then(res => res.json())
        .then(products => {
            const container = document.getElementById('products-container');

            products.forEach(p => {
                const div = document.createElement('div');
                div.className = 'product-card';
                div.innerHTML = `
                    <img src="${p.images?.[0] || ''}" alt="${p.title}">
                    <i class="fas fa-heart"></i>
                    <h4>${p.title}</h4>
                    <p><del>₹${p.originalPrice}</del> <strong>₹${p.sellingPrice}</strong></p>
                `;

                div.onclick = () => location.href = `/product/${p._id}`;
                container.appendChild(div);
            });

            page++;
            loading = false;
            document.getElementById('loading').style.display = products.length < 12 ? 'none' : 'block';
        })
        .catch(err => {
            console.error("Fetch Error:", err);
            loading = false;
        });
}

// Infinite Scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        loadProducts();
    }
});

// Load first batch
loadProducts();
