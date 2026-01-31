const uploadTrigger = document.getElementById("uploadTrigger");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const cropModal = document.getElementById("cropModal");
const cropImg = document.getElementById("cropImg");
const cropConfirm = document.getElementById("cropConfirm");
const MAX_IMAGES = 7;
const OUTPUT_WIDTH = 800;
const OUTPUT_HEIGHT = 600;
let base64Images = [];
let filesQueue = [];
let currentIndex = 0;
let cropper = null;
uploadTrigger.addEventListener("click", () => imageUpload.click());
imageUpload.addEventListener("change", function () {
  const files = Array.from(this.files);
  if (files.length < 1) return;
  if (base64Images.length + files.length > MAX_IMAGES) {
    alert("Maximum 7 images allowed");
    imageUpload.value = "";
    return;
  }
  filesQueue = files.filter(f => f.type.startsWith("image/"));
  currentIndex = 0;
  openCrop();
  imageUpload.value = "";
});
function openCrop() {
  if (currentIndex >= filesQueue.length) return;
  const file = filesQueue[currentIndex];
  const reader = new FileReader();
  reader.onload = e => {
    cropImg.src = e.target.result;
    cropModal.style.display = "flex";
    if (cropper) cropper.destroy();
    cropper = new Cropper(cropImg, {
      aspectRatio: 3 / 4, 
      viewMode: 1,
      autoCropArea: 1,
      movable: false,
      zoomable: true,
      scalable: false,
      rotatable: false
    });
  };
  reader.readAsDataURL(file);
}
cropConfirm.onclick = () => {
  if (!cropper) return;
  const canvas = cropper.getCroppedCanvas({
    width: OUTPUT_WIDTH,
    height: OUTPUT_HEIGHT
  });
  const base64 = canvas.toDataURL("image/jpeg", 0.8); // compressed
  base64Images.push(base64);
  const div = document.createElement("div");
  div.className = "preview-item";
  div.innerHTML = `
    <img src="${base64}">
    <button class="remove-btn">×</button>
  `;
  div.querySelector(".remove-btn").onclick = () => {
    const i = base64Images.indexOf(base64);
    if (i > -1) base64Images.splice(i, 1);
    div.remove();
  };
  imagePreview.appendChild(div);
  cropper.destroy();
  cropModal.style.display = "none";
  cropper = null;
  currentIndex++;
  openCrop();
};
function closeCrop() {
  if (cropper) cropper.destroy();
  cropModal.style.display = "none";
  cropper = null;
}
document.getElementById("productForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  if (base64Images.length < 1) {
    alert("Upload at least 1 image.");
    return;
  }
  const productData = {
    title: document.getElementById("productTitle").value,
    description: document.getElementById("productDescription").value,
    originalPrice: document.getElementById("originalPrice").value,
    sellingPrice: document.getElementById("sellingPrice").value,
    images: base64Images
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
