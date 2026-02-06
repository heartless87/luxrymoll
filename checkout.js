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
document.getElementById("section-title").innerText = data.title;
document.getElementById("delivery-type").innerText = data.desc;
const user = JSON.parse(localStorage.getItem("luxuryUser"));
if (user && user.email) {
  fetch(
    `https://luxrymoll.vercel.app/api/getFirstAddress?email=${encodeURIComponent(user.email)}`
  )
    .then(res => res.json())
    .then(result => {
      if (!result.success || !result.address) return;

      const a = result.address;

      const addressSentence =
        `${a.fullName}, ` +
        `${a.address1} ${a.address2 || ""}, ` +
        `${a.city} - ${a.zip}, ` +
        `Phone: ${a.phone}`;

      const el = document.getElementById("address-text");
      if (el) {
        el.innerText = addressSentence;
      }
    })
    .catch(err => {
      console.error("Address fetch failed", err);
    });
}
