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
    // ⭐ page param hata diya (random API ke liye)
    const res = await fetch(`${BACKEND_URL}/api/getProducts`);
    if (!res.ok) {
      loader.innerText = "Failed to load products!";
      loading = false;
      return;
    }

    const products = await res.json();
    const container = document.getElementById("products-container");

    let newCount = 0;

    products.forEach(p => {
      if (loadedProductIds.has(p._id)) return;

      loadedProductIds.add(p._id);
      newCount++;

      const rawImg = p.images?.[0] || "";
      const imgSrc = convertImg(rawImg) || PLACEHOLDER;

      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `
        <div class="image-wrapper" style="position:relative;">
          <img src="${imgSrc}" alt="${p.title}">
          <label class="ui-bookmark" onclick="event.stopPropagation()">
            <input type="checkbox" />
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
      heart.addEventListener("click", async (e) => {
        e.stopPropagation();
        const user = JSON.parse(localStorage.getItem("luxuryUser"));
        if (!user || !user.email) {
          alert("Please login first");
          return;
        }
        try {
          await fetch("https://luxrymoll.vercel.app/api/likeProduct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              productId: p._id
            })
          });
        } catch (err) {
          console.error("Like failed", err);
        }
      });
      div.onclick = () => {
        location.href = "product.html?id=" + p._id;
      };
      container.appendChild(div);
    });
    if (newCount === 0) {
      loader.innerText = "No more products";
      window.removeEventListener("scroll", handleScroll);
    } else {
      loader.style.display = "none";
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    loader.innerText = "Error loading products.";
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
