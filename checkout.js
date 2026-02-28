const data = JSON.parse(localStorage.getItem("checkoutProduct"));
if (!data) {
  alert("No product found");
  location.href = "index.html";
}
const DELIVERY_FEE = 50;
const itemsTotal = data.price;
const finalTotal = itemsTotal + DELIVERY_FEE;
document.getElementById("itemsTotal").innerText = "₹" + itemsTotal;
document.getElementById("finalTotal").innerText = "₹" + finalTotal;
document.getElementById("itemsTotal0").innerText = "₹" + itemsTotal;
document.getElementById("finalTotal0").innerText = "₹" + finalTotal;
document.getElementById("productImage").src = data.image;
document.getElementById("section-title").innerText = data.title;
document.getElementById("delivery-type").innerText = data.desc;
document.getElementById("quantity").innerText = `(${data.qty})`;
const user = JSON.parse(localStorage.getItem("luxuryUser"));
if (user && user.email) {
  const ADDRESS_KEY = `addresses_${user.email.toLowerCase()}`;
  const saved = JSON.parse(localStorage.getItem(ADDRESS_KEY)) || [];
  if (saved.length > 0) {
    const a = saved[0];
    let sentence =
      `${a.fullName}, ` +
      `${a.address1} ${a.address2 || ""}, ` +
      `${a.city} - ${a.zip}, ` +
      `Phone: ${a.phone}`;
    sentence = sentence.match(/.{1,30}/g).join("<br>");
    const el = document.getElementById("address-text");
    if (el) {
      el.innerHTML = sentence;
    }
  }
}  
