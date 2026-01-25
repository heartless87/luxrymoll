const form = document.getElementById("registerForm");

if (!form) {
  console.error("registerForm not found");
} else {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nameInput = document.getElementById("reg_name");
    const emailInput = document.getElementById("reg_email");
    const passInput = document.getElementById("reg_password");

    if (!nameInput || !emailInput || !passInput) {
      alert("Register inputs missing ❌");
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      // 🔐 IMPORTANT: agar JSON na aaye to handle karo
      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        alert("Server routing error ❌ (check vercel.json)");
        return;
      }

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        location.href = "#login";
      }

    } catch (err) {
      console.error("Fetch failed:", err);
      alert("Network / Proxy error ❌");
    }
  });
}
