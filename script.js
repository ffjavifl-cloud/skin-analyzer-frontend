const backendURL = "https://aging-analyzer.onrender.com";
let chartInstance = null;
let previousScores = null;
let backendActivo = false;

async function checkBackendStatus() {
    const statusBox = document.getElementById("status");
    const analyzeButton = document.getElementById("analyzeButton");

    try {
        const response = await fetch(`${backendURL}/status`);
        if (response.ok) {
            statusBox.innerText = "✅ Servicio activo";
            backendActivo = true;
        } else {
            statusBox.innerText = "⚠️ Servicio lento, puedes intentar analizar";
            backendActivo = true;
        }
    } catch (error) {
        statusBox.innerText = "❌ No se pudo conectar con el backend";
        backendActivo = false;
        console.error("Error al verificar estado del backend:", error);
    }

    analyzeButton.disabled = !(backendActivo && fileInput.files.length);
}

window.addEventListener("load", checkBackendStatus);

const fileInput = document.getElementById("imageInput");
const analyzeButton = document.getElementById("analyzeButton");

fileInput.addEventListener("change", () => {
    analyzeButton.disabled = !(backendActivo && fileInput.files.length);
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
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${backendURL}/analyze`, {
            method: "POST",
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Respuesta del backend:", errorText);
            statusBox.innerText = "❌ Error en el análisis. Intenta con otra imagen.";
            return;
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

function mostrarResultados(data) {
    const scores = data.scores;
    const diagnosis = data.diagnosis;
    previousScores = scores;

    const reportDiv = document.getElementById("clinical-report");
    const diagnosisDiv = document.getElementById("diagnostic-report");

    let reportHTML = "<ul>";
    for (const [param, value] of Object.entries(scores)) {
        const emoji = value >= 7 ? "🔴" : value >= 4 ? "🟠" : "🟢";
        reportHTML += `<li>${emoji} <strong>${param}</strong>: ${value}/10</li>`;
    }
    reportHTML += "</ul>";
    reportDiv.innerHTML = reportHTML;

    diagnosisDiv.innerText = `🩺 Diagnóstico: ${diagnosis}`;

    actualizarGrafico(scores);
}

function actualizarGrafico(scores) {
    const ctx = document.getElementById("radarChart").getContext("2d");
    const labels = Object.keys(scores);
    const dataValues = Object.values(scores);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "radar",
        data: {
            labels: labels,
            datasets: [{
                label: "Score clínico",
                data: dataValues,
                backgroundColor: "rgba(0, 102, 204, 0.2)",
                borderColor: "#0066cc",
                pointBackgroundColor: "#0066cc"
            }]
        },
        options: {
            scales: {
                r: {
                    min: 0,
                    max: 10,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}
