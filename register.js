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

    if (!name || !email || !password) {
      alert("All fields required ❌");
      return;
    }

    try {
      const res = await fetch(
        "https://luxrymoll.vercel.app/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, password })
        }
      );

      // 👉 response text pehle padho (safe)
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        alert("Server error ❌ (API not reached)");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Register failed ❌");
        return;
      }

      alert(data.message || "Account created ✅");
      location.href = "#login";

    } catch (err) {
      console.error("Network error:", err);
      alert("Network error ❌");
    }
  });
}
