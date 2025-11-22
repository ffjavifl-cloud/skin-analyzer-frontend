const backendURL = "https://aging-analyzer.onrender.com";

async function checkBackendStatus() {
    const statusBox = document.getElementById("status");
    const analyzeButton = document.getElementById("analyzeButton");

    try {
        const response = await fetch(`${backendURL}/analyze`, {
            method: "OPTIONS"
        });
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

        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType.includes("application/json")) {
            throw new Error("Respuesta no válida del backend");
        }

        const result = await response.json();
        resultBox.innerText = formatReport(result);

        requestAnimationFrame(() => {
            renderHexagonChart(result.scores);
        });
    } catch (error) {
        resultBox.innerText = "❌ Error al analizar la imagen";
        console.error("Error en el análisis:", error);
    }
}

function renderHexagonChart(scores) {
    const canvas = document.getElementById("radarChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const labels = [
        "brightness",
        "dryness",
        "lines",
        "pigmentation",
        "texture-pores",
        "wrinkles"
    ];

    const dataValues = labels.map(k => {
        const v = Number(scores[k] ?? 0);
        return Math.max(0, Math.min(10, v));
    });

    const pointColors = dataValues.map(v => {
        if (v >= 7) return "red";
        if (v >= 4) return "orange";
        return "green";
    });

    if (chartInstance && typeof chartInstance.destroy === "function") {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "radar",
        data: {
            labels,
            datasets: [{
                label: "Perfil clínico (0–10)",
                data: dataValues,
                fill: true,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                pointBackgroundColor: pointColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${ctx.parsed.r}/10`
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    min: 0,
                    max: 10,
                    ticks: { stepSize: 2 },
                    grid: { circular: true },
                    pointLabels: { font: { size: 12 } }
                }
            }
        }
    });
}

function downloadChart() {
    const canvas = document.getElementById("radarChart");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "perfil_clinico.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}
