console.log("[listproduct.js] loaded");

const productForm = document.getElementById("productForm");
const imageUpload = document.getElementById("imageUpload");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const messageDiv = document.getElementById("message");

productForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("Form submitted");

    const formData = new FormData();
    formData.append("title", document.getElementById("productTitle").value);
    formData.append("description", document.getElementById("productDescription").value);
    formData.append("originalPrice", document.getElementById("originalPrice").value);
    formData.append("sellingPrice", document.getElementById("sellingPrice").value);

    for (let img of imageUpload.files) {
        formData.append("images", img);
    }

    btnText.innerText = "Saving...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("http://localhost:3000/api/products", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        console.log("Response:", data);

        if (data.success) {
            showMessage("Product added successfully!", true);
            productForm.reset();
        } else {
            showMessage("Failed! Something went wrong.", false);
        }

    } catch (err) {
        console.error(err);
        showMessage("Server error!", false);
    }

    btnText.innerText = "Add Product";
    submitBtn.disabled = false;
});

function showMessage(msg, success) {
    messageDiv.style.display = "block";
    messageDiv.innerText = msg;
    messageDiv.className = success ? "message success" : "message error";

    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 3000);
}
