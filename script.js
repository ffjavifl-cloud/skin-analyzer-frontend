const backendURL = "https://aging-analyzer.onrender.com";

async function analyzeImage() {
    const input = document.getElementById("imageInput");
    const resultBox = document.getElementById("result");

    if (!input.files.length) {
        alert("Por favor selecciona una imagen");
        return;
    }

    const formData = new FormData();
    formData.append("file", input.files[0]);

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
        resultBox.innerText = "Error al conectar con el backend";
        console.error("Error:", error);
    }
}
