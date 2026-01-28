const uploadTrigger = document.getElementById("uploadTrigger");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");

let base64Images = [];

const MAX_IMAGES = 7;
const MAX_FILE_SIZE = 800 * 1024; // 800 KB per image

uploadTrigger.addEventListener("click", () => imageUpload.click());

imageUpload.addEventListener("change", async function () {
    let files = Array.from(this.files);

    for (let file of files) {

        if (base64Images.length >= MAX_IMAGES) {
            alert("Maximum 7 images allowed");
            break;
        }

        if (!file.type.startsWith("image/")) continue;

        if (file.size > MAX_FILE_SIZE) {
            alert("Each image must be under 800 KB");
            continue;
        }

        // Convert to Base64 (compressed)
        let base64 = await convertToBase64(file);
        base64Images.push(base64);

        // Preview
        const div = document.createElement("div");
        div.classList.add("preview-item");

        div.innerHTML = `
            <img src="${base64}">
            <button class="remove-btn">×</button>
        `;

        // Remove image
        div.querySelector(".remove-btn").onclick = () => {
            const index = base64Images.indexOf(base64);
            if (index > -1) base64Images.splice(index, 1);
            div.remove();
        };

        imagePreview.appendChild(div);
    }

    // Allow re-selecting same file again
    imageUpload.value = "";
});

// Convert File → Base64 (Resize + Compress for Vercel Free Tier)
function convertToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        const img = new Image();

        reader.onload = (e) => img.src = e.target.result;

        img.onload = () => {
            const canvas = document.createElement("canvas");

            const MAX_WIDTH = 900;
            const scale = Math.min(1, MAX_WIDTH / img.width);

            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // JPEG compression (0.7 = best balance)
            resolve(canvas.toDataURL("image/jpeg", 0.7));
        };

        reader.readAsDataURL(file);
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

    let res = await fetch("https://luxrymoll.vercel.app/api/addProduct", {
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
