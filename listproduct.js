console.log("[listproduct.js] loaded");

// ========================
// GLOBAL SELECTORS
// ========================
const uploadTrigger = document.getElementById("uploadTrigger");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const productForm = document.getElementById("productForm");
const messageDiv = document.getElementById("message");
const productsList = document.getElementById("productsList");

let selectedImages = [];

// ========================
// IMAGE UPLOAD
// ========================
uploadTrigger.addEventListener("click", () => {
    imageUpload.click();
});

imageUpload.addEventListener("change", function () {
    const files = [...this.files];

    if (selectedImages.length + files.length > 7) {
        showMessage("Maximum 7 images allowed!", true);
        return;
    }

    files.forEach(file => {
        selectedImages.push(file);
        previewImage(file);
    });
});

function previewImage(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const div = document.createElement("div");
        div.classList.add("preview-item");

        div.innerHTML = `
            <img src="${event.target.result}">
            <button class="remove-btn">&times;</button>
        `;

        imagePreview.appendChild(div);

        div.querySelector(".remove-btn").addEventListener("click", () => {
            selectedImages = selectedImages.filter(img => img !== file);
            div.remove();
        });
    };

    reader.readAsDataURL(file);
}

// ========================
// FORM SUBMIT (LOCAL STORAGE)
// ========================
productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
        showMessage("Please upload at least one image!", true);
        return;
    }

    // Convert all selected images to base64
    const base64Images = await Promise.all(selectedImages.map(file => toBase64(file)));

    const product = {
        title: document.getElementById("productTitle").value,
        description: document.getElementById("productDescription").value,
        originalPrice: document.getElementById("originalPrice").value,
        sellingPrice: document.getElementById("sellingPrice").value,
        images: base64Images
    };

    // Save to local storage using listeddata.js function
    window.receiveProductData(product);

    showMessage("Product added successfully!", false);

    // Reset form
    productForm.reset();
    imagePreview.innerHTML = "";
    selectedImages = [];

    loadProducts(); // Refresh product list
});

// Convert File to Base64
function toBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

// ========================
// SHOW PRODUCTS FROM LOCAL STORAGE
// ========================
function loadProducts() {
    const products = window.getProducts();
    productsList.innerHTML = "";

    products.forEach((p) => {
        const div = document.createElement("div");
        div.classList.add("product-card");

        div.innerHTML = `
            <img src="${p.images[0]}" class="product-image" />

            <div class="product-info">
                <h3 class="product-title">${p.title}</h3>
                <p class="product-description">${p.description}</p>

                <div class="product-price-container">
                    <span class="product-original-price">₹${p.originalPrice}</span>
                    <span class="product-selling-price">₹${p.sellingPrice}</span>
                </div>
            </div>
        `;

        productsList.appendChild(div);
    });
}

loadProducts();

// ========================
// MESSAGE BOX
// ========================
function showMessage(msg, error = false) {
    messageDiv.style.display = "block";
    messageDiv.textContent = msg;
    messageDiv.className = "message " + (error ? "error" : "success");

    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 3000);
}
