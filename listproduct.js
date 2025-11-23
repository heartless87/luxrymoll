console.log("[listproduct.js] loaded");

// ========================
// GLOBAL SELECTORS
// ========================
const uploadTrigger = document.getElementById("uploadTrigger");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const productForm = document.getElementById("productForm");
const messageDiv = document.getElementById("message");

// Store selected images
let selectedImages = [];

// ========================
// IMAGE UPLOAD HANDLING
// ========================
uploadTrigger.addEventListener("click", () => {
    console.log("Upload trigger clicked");
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
// FORM SUBMIT
// ========================
productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    if (selectedImages.length === 0) {
        showMessage("Please upload at least one image!", true);
        return;
    }

    const formData = new FormData();
    formData.append("title", document.getElementById("productTitle").value);
    formData.append("description", document.getElementById("productDescription").value);
    formData.append("originalPrice", document.getElementById("originalPrice").value);
    formData.append("sellingPrice", document.getElementById("sellingPrice").value);

    selectedImages.forEach(img => {
        formData.append("images", img);
    });

    try {
        const response = await fetch("http://localhost:3000/api/products", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        console.log("Server:", result);

        if (result.success) {
            showMessage("Product added successfully!", false);
            productForm.reset();
            imagePreview.innerHTML = "";
            selectedImages = [];
        } else {
            showMessage("Server error while saving product!", true);
        }

    } catch (err) {
        console.error(err);
        showMessage("Server connection failed!", true);
    }
});

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
