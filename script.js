let loading = false;
let loadedProductIds = new Set();
const BACKEND_URL = "https://luxrymoll.vercel.app";
const PLACEHOLDER = "/placeholder.png";
function convertImg(str) {
  if (!str) return "";
  const s = String(str).trim();
  if (/^data:image\/[a-z0-9.+-]+;base64,/i.test(s)) return s;
  if (s.startsWith("/9j/")) return `data:image/jpeg;base64,${s}`;
  if (s.startsWith("iVBOR")) return `data:image/png;base64,${s}`;
  return `data:image/jpeg;base64,${s}`;
}
async function loadProducts() {
  if (loading) return;
  loading = true;
  const loader = document.getElementById("loading");
  loader.style.display = "block";
  try {
    const res = await fetch(`${BACKEND_URL}/api/getProducts`);
    if (!res.ok) {
      loader.innerText = "Failed to load products!";
      loading = false;
      return;
    }
    const products = await res.json();
    const container = document.getElementById("products-container");
    for (const p of products) {
      if (loadedProductIds.has(p._id)) continue;

      loadedProductIds.add(p._id);

      const rawImg = p.images?.[0] || "";
      const imgSrc = convertImg(rawImg) || PLACEHOLDER;

      const card = createProductCard(p, imgSrc);
      container.appendChild(card);
    }

    loader.style.display = "none";
  } catch (err) {
    console.error("Product load error:", err);
    loader.innerText = "Error loading products";
  } finally {
    loading = false;
  }
}
function createProductCard(p, imgSrc) {
  const div = document.createElement("div");
  div.className = "product-card";
  div.innerHTML = `
    <div class="image-wrapper" style="position:relative;">
      <img src="${imgSrc}" alt="${p.title}">
        <label class="ui-bookmark" 
               data-product-id="${p._id}"
               onclick="event.stopPropagation()">
          <input type="checkbox"/>
          <div class="bookmark-icon">
            <svg
              viewBox="0 0 16 16"
              class="bi bi-heart-fill"
              height="22"
              width="22"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
                fill-rule="evenodd"
              ></path>
            </svg>
          </div>
        </label>
    </div>
    <div class="product-info">
      <h4 class="product-title">${p.title}</h4>
      <div class="price-row">
        <span class="orig-price">₹${p.originalPrice}</span>
        <span class="sell-price">₹${p.sellingPrice}</span>
        <button class="add-btn">+</button>
      </div>
    </div>
  `;
  div.addEventListener("click", () => {
    location.href = `product.html?id=${p._id}`;
  });

  return div;
}
async function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 900) {
    await loadProducts();
    await autoCheckFavorites();
  }
}
async function autoCheckFavorites() {
  const userData = localStorage.getItem("luxuryUser");
  const user = userData ? JSON.parse(userData) : null;
  if (!user?.email) return;
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/address?email=${encodeURIComponent(user.email)}`
    );
    const data = await res.json();
    if (!data.success) return;
    const likedSet = new Set(
      data.favoItem ? Object.keys(data.favoItem) : []
    );
    document.querySelectorAll(".ui-bookmark").forEach(label => {
      const pid = label.getAttribute("data-product-id");
      const checkbox = label.querySelector("input");
      if (likedSet.has(pid)) {
        checkbox.checked = true;
      }
    });
  } catch (err) {
    console.error("Auto check failed:", err);
  }
}
window.addEventListener("scroll", handleScroll);
loadProducts().then(() => {
  autoCheckFavorites();
});
document.addEventListener("change", async (e) => {
  const checkbox = e.target;
  if (!checkbox.matches(".ui-bookmark input")) return;
  const bookmark = checkbox.closest(".ui-bookmark");
  const productId = bookmark?.getAttribute("data-product-id");
  const userData = localStorage.getItem("luxuryUser");
  const user = userData ? JSON.parse(userData) : null;
  if (!user?.email || !productId) {
    checkbox.checked = !checkbox.checked;
    return;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: user.email.toLowerCase().trim(),
        productId,
        action: checkbox.checked ? "like" : "unlike"
      })
    });

    if (!res.ok) {
      checkbox.checked = !checkbox.checked;
      console.error("API failed:", res.status);
      return;
    }
    const data = await res.json();
    console.log("Like system:", data);
  } catch (err) {
    checkbox.checked = !checkbox.checked;
    console.error("Network error:", err);
  }
});
