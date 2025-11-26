// ---------------- IMAGE CONVERSION TO BASE64 ----------------

const uploadTrigger = document.getElementById("uploadTrigger");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");

let base64Images = [];

uploadTrigger.addEventListener("click", () => imageUpload.click());

imageUpload.addEventListener("change", async function () {
    base64Images = []; 
    imagePreview.innerHTML = "";

    let files = Array.from(this.files);

    if (files.length < 1 || files.length > 7) {
        alert("Please upload minimum 1 and maximum 7 images");
        return;
    }

    for (let i = 0; i < files.length; i++) {
        let file = files[i];

        // Convert to Base64
        let base64 = await convertToBase64(file);
        base64Images.push(base64);

        // Preview
        const div = document.createElement("div");
        div.classList.add("preview-item");

        div.innerHTML = `
            <img src="${base64}">
            <button class="remove-btn" data-index="${i}">×</button>
        `;

        imagePreview.appendChild(div);
    }
});

// Convert File → Base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}


// ---------------- SUBMIT FORM ----------------

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

    let res = await fetch("https://YOUR-VERCEL-URL.vercel.app/api/addProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
    });

    let result = await res.json();

    if (result.success) {
        alert("Product Saved Successfully!");
        location.reload();
    } else {
        alert("Error saving product.");
    }

    document.getElementById("btnText").innerText = "Add Product";
});
