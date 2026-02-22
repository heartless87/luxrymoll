document.addEventListener("change", async (e) => {

  const checkbox = e.target;

  if (!checkbox.matches(".ui-bookmark input")) return;

  const bookmark = checkbox.closest(".ui-bookmark");
  const productId = bookmark?.getAttribute("data-product-id");

  const userData = localStorage.getItem("luxuryUser");
  const user = userData ? JSON.parse(userData) : null;

  if (!user?.email || !productId) {
    checkbox.checked = !checkbox.checked;
    return;
  }

  const endpoint = checkbox.checked
    ? "/api/likeProduct"
    : "/api/unlikeProduct";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email.toLowerCase().trim(),
        productId
      })
    });

    if (!response.ok) {
      checkbox.checked = !checkbox.checked;
      return;
    }

    const data = await response.json();
    console.log("API:", data);

  } catch (error) {
    checkbox.checked = !checkbox.checked;
    console.error("Network error:", error);
  }

});
