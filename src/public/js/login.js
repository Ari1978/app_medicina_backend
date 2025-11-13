const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(registerForm);
  const obj = {};
  formData.forEach((value, key) => (obj[key] = value));

  try {
    const res = await fetch("/api/empresa/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj),
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      if (data.redirect) window.location.href = data.redirect;
    } else {
      alert(data.message || "Registro fallido");
    }
  } catch (err) {
    console.error("Error en registro:", err);
    alert("Error del servidor");
  }
});

