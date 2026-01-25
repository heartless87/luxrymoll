const form = document.getElementById("registerForm");

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("reg_name").value;
    const email = document.getElementById("reg_email").value;
    const password = document.getElementById("reg_password").value;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        location.href = "#login";
      }
    } catch (err) {
      console.error(err);
      alert("Register failed ❌");
    }
  });
}
