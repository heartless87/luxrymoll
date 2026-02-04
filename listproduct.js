const uploadTrigger = document.getElementById("uploadTrigger");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
let base64Images = [];
const MAX_IMAGES = 7;
const MAX_FILE_SIZE = 1 * 1024 * 1024;
uploadTrigger.addEventListener("click", () => imageUpload.click());
imageUpload.addEventListener("change", async function () {
  const files = Array.from(this.files);
  for (const file of files) {
    if (base64Images.length >= MAX_IMAGES) {
      alert("Maximum 7 images allowed");
      break;
    }

    if (!file.type.startsWith("image/")) continue;

    if (file.size > MAX_FILE_SIZE) {
      alert("Image too large (max 1MB)");
      continue;
    }

    // 🔥 auto resize + compress (NO CROP)
    const base64 = await resizeAndCompress(file);
    base64Images.push(base64);

    const div = document.createElement("div");
    div.className = "preview-item";
    div.innerHTML = `
      <img src="${base64}">
      <button class="remove-btn">×</button>
    `;

    div.querySelector(".remove-btn").onclick = () => {
      const index = base64Images.indexOf(base64);
      if (index > -1) base64Images.splice(index, 1);
      div.remove();
    };

    imagePreview.appendChild(div);
  }

  // allow re-select same file
  imageUpload.value = "";
});

// 🔹 Resize + compress only (keeps original ratio)
function resizeAndCompress(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = e => img.src = e.target.result;

    img.onload = () => {
      const canvas = document.createElement("canvas");

      const MAX_WIDTH = 1200; // safe for Vercel
      const scale = Math.min(1, MAX_WIDTH / img.width);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };

    reader.readAsDataURL(file);
  });
}

document.getElementById("productForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem("luxuryUser"));
  if (!user || !user.email) {
    alert("Please login before listing a product ❌");
    return;
  }
  if (base64Images.length < 1) {
    alert("Upload at least 1 image.");
    return;
  }
  const productData = {
    title: document.getElementById("productTitle").value,
    description: document.getElementById("productDescription").value,
    originalPrice: document.getElementById("originalPrice").value,
    sellingPrice: document.getElementById("sellingPrice").value,
    images: base64Images,
    sellerEmail: user.email
  };
  document.getElementById("btnText").innerText = "Saving...";
  const res = await fetch("https://luxrymoll.vercel.app/api/addProduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData)
  });

  const result = await res.json();

  if (result.success) {
    alert("Product Saved Successfully!");
    location.reload();
  } else {
    alert("Error saving product.");
  }

  document.getElementById("btnText").innerText = "Add Product";
});
