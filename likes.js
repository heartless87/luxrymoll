document.addEventListener("change", async (e) => {

  const checkbox = e.target;

  // Only run if checkbox inside .ui-bookmark
  if (!checkbox.matches(".ui-bookmark input")) return;

  const bookmark = checkbox.closest(".ui-bookmark");
  const productId = bookmark?.getAttribute("data-product-id");

  const userData = localStorage.getItem("luxuryUser");
  const user = userData ? JSON.parse(userData) : null;

  console.log("EMAIL:", user?.email);
  console.log("PRODUCT ID:", productId);
  console.log("CHECKED:", checkbox.checked);

  // Validation
  if (!user?.email || !productId) {
    console.log("Missing email or productId");
    checkbox.checked = !checkbox.checked; // revert state
    return;
  }

  const endpoint = checkbox.checked
    ? "/api/likeProduct"
    : "/api/unlikeProduct";

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: user.email.trim().toLowerCase(),
        productId
      })
    });

    console.log("STATUS:", response.status);

    if (!response.ok) {
      console.error("Request failed");
      checkbox.checked = !checkbox.checked; // revert state
      return;
    }

    const data = await response.json();
    console.log("API RESPONSE:", data);

  } catch (error) {
    console.error("Network error:", error);
    checkbox.checked = !checkbox.checked; // revert state
  }

});
