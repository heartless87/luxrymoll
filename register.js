const form = document.getElementById("registerForm");
const btn = document.getElementById("registerBtn");

if (btn) {
  btn.addEventListener("click", async function () {
    const name = document.getElementById("reg_name")?.value.trim();
    const email = document.getElementById("reg_email")?.value.trim();
    const password = document.getElementById("reg_password")?.value.trim();

    if (!name || !email || !password) {
      alert("All fields required ❌");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      alert(data.message || "Done");

      if (res.ok) {
        window.location.hash = "#login";
        form.reset();
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Network error ❌");
    }
  });
}
