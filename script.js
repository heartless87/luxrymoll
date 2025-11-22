let page = 1;
let loading = false;

function loadProducts() {
    if (loading) return;
    loading = true;
    document.getElementById('loading').style.display = 'block';

    fetch(`/api/products?page=${page}`)
        .then(res => res.json())
        .then(products => {
            const container = document.getElementById('products-container');
            products.forEach(p => {
                const div = document.createElement('div');
                div.className = 'product-card';
                div.innerHTML = `
                    <img src="${p.image}" alt="${p.title}">
                    <i class="fas fa-heart"></i>
                    <h4>${p.title}</h4>
                    <p><del>₹${p.original_price}</del> <strong>₹${p.sell_price}</strong></p>
                `;
                div.onclick = () => location.href = `/product/${p.id}`;
                container.appendChild(div);
            });

            page++;
            loading = false;
            document.getElementById('loading').style.display = products.length < 12 ? 'none' : 'block';
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
