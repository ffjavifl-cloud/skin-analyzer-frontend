const backendURL = "https://aging-analyzer.onrender.com";

// Verificar estado del backend al cargar la página
async function checkBackendStatus() {
    const statusBox = document.getElementById("status");
    const analyzeButton = document.getElementById("analyzeButton");

    try {
        const response = await fetch(`${backendURL}/`);
        if (response.ok) {
            statusBox.innerText = "✅ Servicio activo";
            analyzeButton.disabled = false;
        } else {
            statusBox.innerText = "⚠️ Servicio lento, puedes intentar analizar";
            analyzeButton.disabled = false;
        }
    } catch (error) {
        statusBox.innerText = "❌ No se pudo conectar con el backend";
        analyzeButton.disabled = false;
        console.error("Error al verificar estado del backend:", error);
    }
}

// Ejecutar verificación al cargar la página
window.addEventListener("load", checkBackendStatus);

// Función principal para analizar imagen
async function analyzeImage() {
    const input = document.getElementById("imageInput");
    const resultBox = document.getElementById("result");

    if (!input.files.length) {
        alert("Por favor selecciona una imagen");
        return;
    }

    const formData = new FormData();
    formData.append("file", input.files[0]);

    resultBox.innerText = "⏳ Analizando imagen...";

    try {
        const response = await fetch(`${backendURL}/analyze`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Respuesta no válida del backend");
        }

        const result = await response.json();

        // Formatear informe clínico
        let reportText = `🧾 ${result.diagnosis}\n\n`;
        for (const [param, value] of Object.entries(result.scores)) {
            reportText += `🔹 ${param}: ${value}/10\n`;
        }

        resultBox.innerText = reportText;
    } catch (error) {
        resultBox.innerText = "❌ Error al conectar con el backend";
        console.error("Error:", error);
    }
}

// Función para copiar informe
function copyReport() {
    const resultBox = document.getElementById("result");
    navigator.clipboard.writeText(resultBox.innerText)
        .then(() => alert("Informe copiado al portapapeles"))
        .catch(() => alert("Error al copiar el informe"));
}
