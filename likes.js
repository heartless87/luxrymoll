const BACKEND_URL = "https://luxrymoll.vercel.app";
document.addEventListener("click", async (e) => {
  const bookmark = e.target.closest(".ui-bookmark");
  if (!bookmark) return;

  e.stopPropagation();

  const checkbox = bookmark.querySelector("input");
  const productId = bookmark.dataset.productId;

  const user = JSON.parse(localStorage.getItem("luxuryUser"));

  if (!user || !user.email) {
    alert("Please login first");
    checkbox.checked = false;
    return;
  }

  try {
    if (checkbox.checked) {
      await fetch(`${BACKEND_URL}/api/likeProduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          productId: productId,
        }),
      });
    } else {
      await fetch(`${BACKEND_URL}/api/unlikeProduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          productId: productId,
        }),
      });
    }
  } catch (err) {
    console.error("Like/Unlike error:", err);
  }
});
