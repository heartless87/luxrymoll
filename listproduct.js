console.log("[listproduct.js loaded]");

// Selectors
const uploadTrigger = document.getElementById("uploadTrigger");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const productForm = document.getElementById("productForm");
let selectedImages = [];

// Upload Button Click
uploadTrigger.addEventListener("click", () => {
    imageUpload.click();
});

// Handle Image Selection
imageUpload.addEventListener("change", function () {
    const files = [...this.files];

    if (selectedImages.length + files.length > 7) {
        alert("Maximum 7 images allowed!");
        return;
    }

    files.forEach(file => {
        selectedImages.push(file);
        previewImage(file);
    });
});

// Preview Function
function previewImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const div = document.createElement("div");
        div.className = "preview-item";
        div.innerHTML = `
            <img src="${e.target.result}">
            <button class="remove-btn">&times;</button>
        `;

        div.querySelector(".remove-btn").onclick = () => {
            selectedImages = selectedImages.filter(img => img !== file);
            div.remove();
        };

        imagePreview.appendChild(div);
    };
    reader.readAsDataURL(file);
}

// Form Submit
productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
        alert("At least one image is required!");
        return;
    }

    const formData = new FormData();
    formData.append("title", document.getElementById("productTitle").value);
    formData.append("description", document.getElementById("productDescription").value);
    formData.append("originalPrice", document.getElementById("originalPrice").value);
    formData.append("sellingPrice", document.getElementById("sellingPrice").value);

    selectedImages.forEach(img => formData.append("images", img));

    const response = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        body: formData
    });

    const result = await response.json();
    console.log(result);

    if (result.success) {
        alert("Product Added Successfully!");

        productForm.reset();
        imagePreview.innerHTML = "";
        selectedImages = [];
    } else {
        alert("Error: " + result.message);
    }
});
