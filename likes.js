document.addEventListener("click", async (e) => {
  const bookmark = e.target.closest(".ui-bookmark");
  if (!bookmark) return;

  e.stopPropagation();

  const checkbox = bookmark.querySelector("input");

  // 🔥 safer method
  const productId = bookmark.getAttribute("data-product-id");

  const user = JSON.parse(localStorage.getItem("luxuryUser"));

  console.log("EMAIL:", user?.email);
  console.log("PRODUCT ID:", productId);

  if (!user || !user.email || !productId) {
    console.log("Missing email or productId");
    checkbox.checked = false;
    return;
  }

  try {
    const url = checkbox.checked
      ? `${BACKEND_URL}/api/likeProduct`
      : `${BACKEND_URL}/api/unlikeProduct`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        productId: productId,
      }),
    });

    const data = await res.json();
    console.log("API RESPONSE:", data);

  } catch (err) {
    console.error("Like/Unlike error:", err);
  }
});
