// js/register.js
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recolectar datos del formulario
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData.entries());

    // Validación simple
    const requiredFields = ["nombre", "cuil", "direccion", "email", "password"];
    const missingFields = requiredFields.filter(f => !data[f] || data[f].trim() === "");

    if (missingFields.length > 0) {
      alert(`Faltan campos obligatorios: ${missingFields.join(", ")}`);
      return;
    }

    try {
      const response = await fetch("/api/empresa/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        if (result.redirect) window.location.href = result.redirect;
      } else {
        alert(result.message || "Error en el registro");
      }
    } catch (err) {
      console.error("Error al registrar empresa:", err);
      alert("Error del servidor");
    }
  });
});
