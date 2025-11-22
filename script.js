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
            analyzeButton.disabled = true; // se activa solo si hay imagen
        } else {
            statusBox.innerText = "⚠️ Servicio lento, puedes intentar analizar";
            analyzeButton.disabled = true;
        }
    } catch (error) {
        statusBox.innerText = "❌ No se pudo conectar con el backend";
        analyzeButton.disabled = true;
        console.error("Error al verificar estado del backend:", error);
    }
}

window.addEventListener("load", checkBackendStatus);

// Activar botón solo si hay imagen
const fileInput = document.getElementById("imageInput");
const analyzeButton = document.getElementById("analyzeButton");

fileInput.addEventListener("change", () => {
    analyzeButton.disabled = !fileInput.files.length;
});

async function analyzeImage() {
    const statusBox = document.getElementById("status");
    statusBox.innerText = "⏳ Analizando imagen...";

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
            const errorText = await response.text();
            throw new Error(`Error del backend: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("📊 Respuesta recibida:", data);
        mostrarResultados(data);
        statusBox.innerText = "✅ Análisis completado";
    } catch (error) {
        statusBox.innerText = "❌ Error en el análisis. Intenta con otra imagen.";
        console.error("Error al analizar:", error);
    }
}

analyzeButton.addEventListener("click", analyzeImage);

// Aquí puedes mantener tus funciones mostrarResultados, generarInforme, descargarPDF, compartirInforme, descargarGrafico, etc.
