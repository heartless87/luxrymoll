const data = JSON.parse(localStorage.getItem("checkoutProduct"));

if (!data) {
  alert("No product found");
  location.href = "index.html";
}

const DELIVERY_FEE = 50;

const itemsTotal = data.price * data.qty;
const finalTotal = itemsTotal + DELIVERY_FEE;

document.getElementById("itemsTotal").innerText = "₹" + itemsTotal;
document.getElementById("finalTotal").innerText = "₹" + finalTotal;
document.getElementById("productImage").src = data.image;
