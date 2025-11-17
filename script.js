const backendUrl = "https://aging-analyzer.onrender.com";

async function checkStatus() {
  try {
    const res = await fetch(backendUrl + "/");
    if (res.ok) {
      document.getElementById("status").innerText = "Estado del servicio: activo";
    } else {
      document.getElementById("status").innerText = "Estado del servicio: no disponible";
    }
  } catch (e) {
    document.getElementById("status").innerText = "Estado del servicio: no disponible";
  }
}

document.getElementById("analyze-btn").addEventListener("click", async () => {
  const fileInput = document.getElementById("image-upload");
  if (!fileInput.files.length) {
    alert("Por favor, selecciona una imagen.");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch(backendUrl + "/analyze", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      document.getElementById("diagnostic-report").innerText = "Error al analizar la imagen.";
      return;
    }

    const data = await res.json();

    // Mostrar tipo Fitzpatrick
    document.getElementById("fitzpatrick-label").innerText =
      "Tipo de piel (Fitzpatrick): " + data.fitzpatrick;

    // Mostrar frases clínicas por parámetro
    let reportHtml = "<h3>Informe clínico</h3><ul>";
    for (const [param, phrase] of Object.entries(data.report)) {
      reportHtml += `<li>${phrase}</li>`;
    }
    reportHtml += "</ul>";
    document.getElementById("clinical-report").innerHTML = reportHtml;

    // Mostrar diagnóstico completo
    document.getElementById("diagnostic-report").innerText = data.diagnosis;

  } catch (e) {
    document.getElementById("diagnostic-report").innerText = "Error al analizar: " + e.message;
  }
});

// Botón para copiar informe
document.getElementById("copy-report").addEventListener("click", () => {
  const reportText =
    document.getElementById("fitzpatrick-label").innerText + "\n" +
    document.getElementById("clinical-report").innerText + "\n" +
    document.getElementById("diagnostic-report").innerText;

  navigator.clipboard.writeText(reportText).then(() => {
    alert("Informe copiado al portapapeles");
  });
});

// Comprobar estado al cargar
checkStatus();
