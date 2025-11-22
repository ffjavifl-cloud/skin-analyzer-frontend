const backendURL = "https://aging-analyzer.onrender.com";
let chartInstance = null;
let previousScores = null;

async function checkBackendStatus() {
    const statusBox = document.getElementById("status");
    const analyzeButton = document.getElementById("analyzeButton");

    try {
        const response = await fetch(`${backendURL}/status`);
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

window.addEventListener("load", checkBackendStatus);

async function analyzeImage() {
    const statusBox = document.getElementById("status");
    statusBox.innerText = "⏳ Analizando imagen...";

    const fileInput = document.getElementById("imageInput");
    const analyzeButton = document.getElementById("analyzeButton");
    const file = fileInput.files[0];

    if (!file) {
        statusBox.innerText = "⚠️ Selecciona una imagen antes de analizar.";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

        const response = await fetch(`${backendURL}/analyze`, {
            method: "POST",
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error("Respuesta no válida del backend");
        }

        const data = await response.json();
        mostrarResultados(data);
        statusBox.innerText = "✅ Análisis completado";
    } catch (error) {
        statusBox.innerText = "❌ Error en el análisis. Intenta con otra imagen.";
        console.error("Error al analizar:", error);
    }
}

document.getElementById("analyzeButton").addEventListener("click", analyzeImage);

// Aquí puedes mantener tus funciones mostrarResultados, generarInforme, descargarPDF, compartirInforme, descargarGrafico, etc.
