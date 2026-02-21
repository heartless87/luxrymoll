document.addEventListener("change", async (e) => {

  const checkbox = e.target.closest(".ui-bookmark input");
  if (!checkbox) return;

  const bookmark = checkbox.closest(".ui-bookmark");
  const productId = bookmark.getAttribute("data-product-id");

  const user = JSON.parse(localStorage.getItem("luxuryUser"));

  console.log("EMAIL:", user?.email);
  console.log("PRODUCT ID:", productId);
  console.log("CHECKED:", checkbox.checked);

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

    console.log("STATUS:", res.status);
    const data = await res.json();
    console.log("API RESPONSE:", data);

  } catch (err) {
    console.error("Like/Unlike error:", err);
  }
});
