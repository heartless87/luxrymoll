console.log("[listproduct.js] loaded");

// ========================
// GLOBAL SELECTORS
// ========================
const uploadTrigger = document.getElementById("uploadTrigger");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const productForm = document.getElementById("productForm");
const productsList = document.getElementById("productsList");
const messageDiv = document.getElementById("message");

// Store selected images
let selectedImages = [];

// ========================
// IMAGE UPLOAD HANDLING
// ========================
uploadTrigger.addEventListener("click", () => imageUpload.click());

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
// FORM SUBMIT
// ========================
productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("productTitle").value.trim();
    const description = document.getElementById("productDescription").value.trim();
    const original = document.getElementById("originalPrice").value.trim();
    const selling = document.getElementById("sellingPrice").value.trim();

    if (!title || !description || !original || !selling) {
        showMessage("All fields are required!", true);
        return;
    }

    if (selectedImages.length === 0) {
        showMessage("Please upload at least one image!", true);
        return;
    }

    // Prepare form data for server
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("originalPrice", original);
    formData.append("sellingPrice", selling);

    selectedImages.forEach(img => {
        formData.append("images", img);
    });

    // ========================
    // SEND TO SERVER (MongoDB)
    // ========================
    const response = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    if (!result.success) {
        showMessage("Server error: Could not save product!", true);
        return;
    }

    // Save in localStorage
    saveLocalProduct({
        id: result.id,
        title,
        description,
        originalPrice: original,
        sellingPrice: selling,
        images: selectedImages.map(img => URL.createObjectURL(img))
    });

    showMessage("Product added successfully!", false);

    productForm.reset();
    selectedImages = [];
    imagePreview.innerHTML = "";

    loadProducts();
});

// ========================
// LOCAL STORAGE
// ========================
function saveLocalProduct(product) {
    let stored = JSON.parse(localStorage.getItem("luxuryProducts_v1")) || [];
    stored.push(product);
    localStorage.setItem("luxuryProducts_v1", JSON.stringify(stored));
}

function loadProducts() {
    productsList.innerHTML = "";
    let stored = JSON.parse(localStorage.getItem("luxuryProducts_v1")) || [];

    stored.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        card.innerHTML = `
            <img class="product-image" src="${product.images[0]}">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price-container">
                    <span class="product-original-price">₹${product.originalPrice}</span>
                    <span class="product-selling-price">₹${product.sellingPrice}</span>
                </div>
            </div>
        `;

        productsList.appendChild(card);
    });
}

loadProducts();

// ========================
// MESSAGE HANDLER
// ========================
function showMessage(msg, error = false) {
    messageDiv.style.display = "block";
    messageDiv.textContent = msg;
    messageDiv.className = "message " + (error ? "error" : "success");

    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 3000);
}
