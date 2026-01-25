const BACKEND_URL = "https://luxrymoll.vercel.app";

document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {

    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${BACKEND_URL}/api/register`, {
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
