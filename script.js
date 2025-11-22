const backendURL = "https://aging-analyzer.onrender.com";
let chartInstance = null;
let previousScores = null;

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

function getClinicalPhrase(param, value) {
    if (param === "brightness") {
        if (value >= 7) return "Brillo excesivo, posible oleosidad o sobreexposición.";
        if (value >= 4) return "Brillo moderado, piel posiblemente mixta.";
        return "Brillo bajo, piel apagada o seca.";
    }
    if (param === "dryness") {
        if (value >= 7) return "Sequedad severa, posible deshidratación o descamación.";
        if (value >= 4) return "Sequedad moderada, requiere hidratación regular.";
        return "Piel bien hidratada.";
    }
    if (param === "lines") {
        if (value >= 7) return "Líneas visibles marcadas, signos de envejecimiento.";
        if (value >= 4) return "Líneas moderadas, envejecimiento incipiente.";
        return "Piel lisa, sin líneas visibles.";
    }
    if (param === "pigmentation") {
        if (value >= 7) return "Pigmentación destacada, posible daño solar o melasma.";
        if (value >= 4) return "Pigmentación moderada, requiere protección solar.";
        return "Pigmentación leve o uniforme.";
    }
    if (param === "texture-pores") {
        if (value >= 7) return "Poros marcados, textura irregular.";
        if (value >= 4) return "Poros visibles, textura mixta.";
        return "Textura uniforme, poros poco visibles.";
    }
    if (param === "wrinkles") {
        if (value >= 7) return "Arrugas profundas, envejecimiento avanzado.";
        if (value >= 4) return "Arrugas moderadas, signos de edad.";
        return "Piel sin arrugas visibles.";
    }
    return "";
}

function formatReport(result) {
    const { scores, diagnosis } = result;
    let reportText = `🧾 ${diagnosis}\n\n`;

    for (const [param, value] of Object.entries(scores)) {
        const emoji = getSeverityEmoji(value);
        const bar = getBar(value);
        const phrase = getClinicalPhrase(param, value);
        reportText += `${emoji} ${param}: ${value}/10\n${bar}\n🩺 ${phrase}\n\n`;
    }

    return reportText;
}

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

        previousScores = result.scores;
    } catch (error) {
        resultBox.innerText = "❌ Error al analizar la imagen";
        console.error("Error en el análisis:", error);
    }
}

function renderHexagonChart(currentScores) {
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

    const currentValues = labels.map(k => Math.max(0, Math.min(10, Number(currentScores[k] ?? 0))));
    const previousValues = previousScores ? labels.map(k => Math.max(0, Math.min(10, Number(previousScores[k] ?? 0)))) : null;

    const pointColors = currentValues.map(v => {
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
            datasets: [
                {
                    label: "Actual",
                    data: currentValues,
                    fill: true,
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    pointBackgroundColor: pointColors
                },
                previousValues && {
                    label: "Anterior
