const form = document.getElementById("registerForm");

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("reg_name").value.trim();
    const email = document.getElementById("reg_email").value.trim();
    const password = document.getElementById("reg_password").value.trim();

    try {
      const res = await fetch(
        "https://luxrymoll.vercel.app/api/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        }
      );

      const text = await res.text();
      const data = JSON.parse(text);

      alert(data.message);
      if (res.ok) location.href = "#login";

    } catch (err) {
      alert("Network / CORS error ❌");
    }
  });
}
