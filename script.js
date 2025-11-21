const backendURL = "https://aging-analyzer.onrender.com";

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

window.addEventListener("load", checkBackendStatus);

function getSeverityEmoji(value) {
    if (value >= 7) return "🔴";
    if (value >= 4) return "🟠";
    if (value > 0) return "🟡";
    return "🟢";
}

function getBar(value) {
    const filled = "█".repeat(Math.round(value));
    const empty = "░".repeat(10 - Math.round(value));
    return filled + empty;
}

function formatReport(result) {
    const { scores, diagnosis } = result;
    let reportText = `🧾 ${diagnosis}\n\n`;

    for (const [param, value] of Object.entries(scores)) {
        const emoji = getSeverityEmoji(value);
        const bar = getBar(value);
        reportText += `${emoji} ${param}: ${value}/10\n${bar}\n\n`;
    }

    return reportText;
}

let chartInstance = null;

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
        resultBox.innerText = formatReport(result);
        renderHexagonChart(result.scores);
    } catch (error) {
        resultBox.innerText = "❌ Error al conectar con el backend";
        console.error("Error:", error);
    }
}

function copyReport() {
    const resultBox = document.getElementById("result");
    navigator.clipboard.writeText(resultBox.innerText)
        .then(() => alert("Informe copiado al portapapeles"))
        .catch(() => alert("Error al copiar el informe"));
}

function renderHexagonChart(scores) {
    const ctx = document.getElementById("hexagonChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "radar",
        data: {
            labels: Object.keys(scores),
            datasets: [{
                label: "Score clínico",
                data: Object.values(scores),
                backgroundColor: "rgba(0, 120, 212, 0.2)",
                borderColor: "#0078D4",
                borderWidth: 2,
                pointBackgroundColor: "#0078D4"
            }]
        },
        options: {
            scales: {
                r: {
                    min: 0,
                    max: 10,
                    ticks: { stepSize: 2 },
                    pointLabels: { font: { size: 14 } }
                }
            },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "Visualización clínica en hexágono",
                    font: { size: 16 }
                }
            }
        }
    });
}
