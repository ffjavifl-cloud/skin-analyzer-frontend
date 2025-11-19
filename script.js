const backendURL = "https://aging-analyzer.onrender.com"; // ✅ Asegúrate que esta URL sea la correcta

document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyze-btn");
  const imageInput = document.getElementById("image-upload");
  const statusDiv = document.getElementById("status");
  const fitzpatrickLabel = document.getElementById("fitzpatrick-label");
  const clinicalReport = document.getElementById("clinical-report");
  const diagnosticReport = document.getElementById("diagnostic-report");
  const copyBtn = document.getElementById("copy-report");

  // ✅ Comprobar si el backend está activo
  fetch(backendURL + "/")
    .then(res => res.ok ? statusDiv.textContent = "Estado del servicio: activo" : statusDiv.textContent = "Estado del servicio: inactivo")
    .catch(() => statusDiv.textContent = "Estado del servicio: error de conexión");

  analyzeBtn.addEventListener("click", async () => {
    const file = imageInput.files[0];
    if (!file) return alert("Selecciona una imagen primero.");

    statusDiv.textContent = "Analizando...";
    clinicalReport.innerHTML = "";
    diagnosticReport.textContent = "";
    fitzpatrickLabel.textContent = "";

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(backendURL + "/analyze", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Error al analizar");

      const data = await res.json();

      // ✅ Mostrar tipo de piel
      fitzpatrickLabel.textContent = "Tipo de piel (Fitzpatrick): " + data.fitzpatrick;

      // ✅ Mostrar informe clínico
      const ul = document.createElement("ul");
      data.report.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.parameter}: ${item.clinical_phrase} (Score: ${item.score}/10)`;
        ul.appendChild(li);
      });
      clinicalReport.appendChild(ul);

      // ✅ Mostrar diagnóstico
      diagnosticReport.textContent = "Diagnóstico: " + data.diagnosis;

      // ✅ Copiar informe
      copyBtn.onclick = () => {
        const text = `Tipo de piel: ${data.fitzpatrick}\n\n` +
          data.report.map(item => `${item.parameter}: ${item.clinical_phrase} (Score: ${item.score}/10)`).join("\n") +
          `\n\nDiagnóstico: ${data.diagnosis}`;
        navigator.clipboard.writeText(text);
        alert("Informe copiado.");
      };

      statusDiv.textContent = "Análisis completado ✅";
    } catch (err) {
      statusDiv.textContent = "Error al analizar: " + err.message;
    }
  });
});
