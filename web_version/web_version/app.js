const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let model = null;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.strokeStyle = "white";
ctx.lineWidth = 20;
ctx.lineCap = "round";
ctx.lineJoin = "round";

function getPosition(event) {

    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left)
            * canvas.width / rect.width,

        y: (event.clientY - rect.top)
            * canvas.height / rect.height
    };
}

canvas.addEventListener("pointerdown", function(event) {

    drawing = true;

    const position = getPosition(event);

    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
});

canvas.addEventListener("pointermove", function(event) {

    if (!drawing) {
        return;
    }

    const position = getPosition(event);

    ctx.lineTo(position.x, position.y);
    ctx.stroke();
});

canvas.addEventListener("pointerup", function() {

    drawing = false;

    ctx.closePath();
});

canvas.addEventListener("pointerleave", function() {

    drawing = false;
});

function clearCanvas() {

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.getElementById("result").textContent = "-";
}

async function loadModel() {

    try {

        document.getElementById("status").textContent =
            "AI 모델을 불러오는 중입니다...";

        model = await tf.loadLayersModel(
            "https://storage.googleapis.com/tfjs-models/tfjs/mnist_transfer_cnn_v1/model.json"
        );

        document.getElementById("status").textContent =
            "모델 준비 완료! 숫자를 그려주세요.";

    } catch (error) {

        console.error(error);

        document.getElementById("status").textContent =
            "AI 모델을 불러오지 못했습니다.";

    }
}

async function recognize() {

    if (!model) {

        alert("AI 모델이 아직 준비되지 않았습니다.");

        return;
    }

    const image =
        tf.browser.fromPixels(canvas, 1);

    const resized =
        tf.image.resizeBilinear(image, [28, 28]);

    const normalized =
        resized.toFloat().div(255);

    const input =
        normalized.expandDims(0);

    const prediction =
        model.predict(input);

    const result =
        await prediction.data();

    let maxIndex = 0;

    for (let i = 1; i < result.length; i++) {

        if (result[i] > result[maxIndex]) {
            maxIndex = i;
        }
    }

    document.getElementById("result").textContent =
        maxIndex;

    document.getElementById("status").textContent =
        "인식이 완료되었습니다.";

    image.dispose();
    resized.dispose();
    normalized.dispose();
    input.dispose();
    prediction.dispose();
}

loadModel();
