let page = 1;
let isLoading = false;

async function loadProducts() {
    if (isLoading) return;
    isLoading = true;

    const loading = document.getElementById("loading");
    loading.style.display = "block";

    try {
        const res = await fetch(`https://luxrymoll.vercel.app/api/getProducts?page=${page}`);
        const data = await res.json();

        if (!data || data.length === 0) {
            loading.innerText = "No more products";
            return;
        }

        const container = document.getElementById("products-container");

        data.forEach(product => {
            const card = document.createElement("div");
            card.classList.add("product-card");

            // Backend returns FULL data-uri
            const imgSrc = product.images?.[0] || "";

            card.innerHTML = `
                <img src="${imgSrc}" alt="${product.title}" class="product-img">

                <div class="product-details">
                    <h4 class="product-title">${product.title}</h4>

                    <p class="price">
                        <span class="original">₹${product.originalPrice}</span>
                        <span class="selling">₹${product.sellingPrice}</span>
                    </p>
                </div>
            `;

            container.appendChild(card);
        });

        page++;
    } catch (err) {
        console.error("Error loading products:", err);
    }

    loading.style.display = "none";
    isLoading = false;
}

window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadProducts();
    }
});

// First load
loadProducts();
