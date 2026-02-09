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
    const user = JSON.parse(localStorage.getItem("luxuryUser"));
    const LIKE_KEY = user?.email
      ? `likedProducts_${user.email.toLowerCase()}`
      : null;
    const likedProducts = LIKE_KEY
      ? JSON.parse(localStorage.getItem(LIKE_KEY)) || []
      : [];
    let newCount = 0;
    products.forEach(p => {
      if (loadedProductIds.has(p._id)) return;
      loadedProductIds.add(p._id);
      newCount++;
      const rawImg = p.images?.[0] || "";
      const imgSrc = convertImg(rawImg) || PLACEHOLDER;
      const isLiked = likedProducts.includes(p._id);
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `
        <div class="image-wrapper" style="position:relative;">
          <img src="${imgSrc}" alt="${p.title}">
          <label class="ui-bookmark" onclick="event.stopPropagation()">
            <input type="checkbox" ${isLiked ? "checked" : ""}/>
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

        <h4 class="product-title">${p.title}</h4>

        <div class="price-row">
          <span class="orig-price">₹${p.originalPrice}</span>
          <span class="sell-price">₹${p.sellingPrice}</span>
        </div>
      `;
      const heart = div.querySelector(".ui-bookmark");
      const checkbox = heart.querySelector("input");
      heart.addEventListener("click", (e) => {
        e.stopPropagation();
        const user = JSON.parse(localStorage.getItem("luxuryUser"));
        if (!user || !user.email) {
          alert("Please login first");
          checkbox.checked = false;
          return;
        }
        const KEY = `likedProducts_${user.email.toLowerCase()}`;
        let saved = JSON.parse(localStorage.getItem(KEY)) || [];
        if (checkbox.checked) {
          if (!saved.includes(p._id)) saved.push(p._id);
        } else {
          saved = saved.filter(id => id !== p._id);
        }
        localStorage.setItem(KEY, JSON.stringify(saved));
      });
      div.onclick = () => {
        location.href = "product.html?id=" + p._id;
      };
      container.appendChild(div);
    });
    loader.style.display = newCount ? "none" : "block";
  } catch (err) {
    console.error(err);
    loader.innerText = "Error loading products";
  } finally {
    loading = false;
  }
}
function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 900) {
    loadProducts();
  }
}
window.addEventListener("scroll", handleScroll);
loadProducts();
