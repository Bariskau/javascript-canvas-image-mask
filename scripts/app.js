const elements = {
    image: null,
    chooseButton: null,
    saveButton: null,
    fileInput: null
}

const options = {
    mode: "draw",
    isDrawing: false,
    width: 480,
    height: 640,
    brush: {
        size: 35,
        hardness: 1,
        opacity: 1,
    },
}

const canvases = {
    preview: {
        canvas: null,
        ctx: null
    },
    drawing: {
        canvas: null,
        ctx: null
    }
}

function init() {
    // set buttons
    elements.chooseButton = document.getElementById("choose-img")
    elements.saveButton = document.getElementById("save-img")
    elements.fileInput = document.getElementById("file-input")
    elements.fileInput.addEventListener("change", loadImage);
    elements.chooseButton.addEventListener("click", () => elements.fileInput.click());

    prepareAllCanvases();
    bootstrapCanvasEvents();
    bootstrapRangeEvents();
    setDemoImage();
}

function setMode(mode) {
    options.mode = mode
}

function setDemoImage() {
    const image = new Image();
    image.onload = function () {
        handleCanvasForImage(image)
    };
    image.src = "./assets/images/demo.jpg";
    elements.image = image;
    getDrawCursor()
}

function getDrawCursor(brushSize = options.brush.size) {
    const circle = `
		<svg
			height="${brushSize}"
			width="${brushSize}"
			fill="rgb(0 0 0 / 25%)"
			viewBox="0 0 ${brushSize * 2} ${brushSize * 2}"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle
				cx="50%"
				cy="50%"
				r="${brushSize}" 
				stroke="#e4e4e4"
                stroke-width="1"
			/>
		</svg>
	`;
    const cursor = `data:image/svg+xml;base64,${window.btoa(circle)}`;
    canvases.drawing.canvas.style.cursor = `url("${cursor}") ${brushSize / 2} ${brushSize / 2}, crosshair`
};

function bootstrapRangeEvents() {
    const ranges = [
        {
            id: "brush-opacity",
            handler: (el, textEl) => {
                textEl.innerText = el.value;
                options.brush.opacity = (parseInt(el.value) / 100).toFixed(2);
            },
        },
        {
            id: "brush-hardness",
            handler: (el, textEl) => {
                textEl.innerText = el.value;
                options.brush.hardness = 100 - parseInt(el.value);
            },
        },
        {
            id: "brush-size",
            handler: (el, textEl) => {
                textEl.innerText = el.value;
                options.brush.size = parseInt(el.value);
            },
        },
    ];

    ranges.forEach(range => {
        const el = document.getElementById(range.id);
        const textEl = document.getElementById(`${range.id}--value`);
        el.addEventListener("change", (e) => {
            range.handler(el, textEl)
            getDrawCursor();
        })
    })
}

function bootstrapCanvasEvents() {
    canvases.drawing.canvas.addEventListener("mousemove", draw);
    canvases.drawing.canvas.addEventListener("click", (e) => {
        options.isDrawing = true;
        draw(e)
        options.isDrawing = false;
    });
    canvases.drawing.canvas.addEventListener("mousedown", () => {
        options.isDrawing = true;
    });
    canvases.drawing.canvas.addEventListener("mouseup", () => {
        options.isDrawing = false;
    });
    canvases.drawing.canvas.addEventListener("mouseout", () => {
        options.isDrawing = false;
    });
}

function prepareAllCanvases() {
    const drawingCanvas = document.getElementById("drawing-canvas");
    /**
     * Use willReadFrequently for using getImageData without causing hitching.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getContextAttributes#willreadfrequently
     */
    const drawingCtx = drawingCanvas.getContext("2d", {willReadFrequently: true});
    const previewCanvas = document.getElementById("preview-canvas");
    const previewCtx = previewCanvas.getContext("2d");

    canvases.drawing = {
        canvas: drawingCanvas,
        ctx: drawingCtx
    };

    canvases.preview = {
        canvas: previewCanvas,
        ctx: previewCtx
    };
}

function clearCanvases() {
    canvases.drawing.ctx.clearRect(0, 0, options.width, options.height)
    canvases.preview.ctx.clearRect(0, 0, options.width, options.height)
}

function loadImage() {
    const file = document.getElementById('file-input').files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
        const image = new Image();
        image.onload = function () {
            clearCanvases()
            handleCanvasForImage(image)
        };
        image.src = e.target.result;
        elements.image = image;
    }
    getDrawCursor();
}

function handleCanvasForImage(image) {
    const [width, height] = [image.width, image.height]

    // adjusts canvas sizes
    options.width = width;
    options.height = height;
    canvases.drawing.canvas.width = options.width;
    canvases.drawing.canvas.height = options.height;
    canvases.preview.canvas.width = options.width;
    canvases.preview.canvas.height = options.height;

    canvases.drawing.ctx.fillStyle = "white";
    canvases.drawing.ctx.fillRect(0, 0, options.width, options.height);

    // draw the uploaded photo on the preview canvas
    canvases.preview.ctx.drawImage(image, 0, 0, options.width, options.height);
}

/**
 * handles the drawing of brush strokes on the drawing canvas
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowColor
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur
 * @param e
 */
function draw(e) {
    if (!options.isDrawing) return;

    const x = e.offsetX;
    const y = e.offsetY;

    if (options.mode === "draw") {
        canvases.drawing.ctx.fillStyle = canvases.drawing.ctx.shadowColor = `rgba(0,0,0,${options.brush.opacity})`;
    } else {
        canvases.drawing.ctx.fillStyle = canvases.drawing.ctx.shadowColor = `rgba(255,255,255,${options.brush.opacity})`;
    }

    canvases.drawing.ctx.lineJoin = canvases.drawing.ctx.lineCap = 'round';
    canvases.drawing.ctx.shadowBlur = options.brush.hardness;
    canvases.drawing.ctx.beginPath();
    canvases.drawing.ctx.arc(x, y, options.brush.size / 2, 0, Math.PI * 2);
    canvases.drawing.ctx.fill();

    requestAnimationFrame(applyMask);
}


/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Alpha
 * Applies a mask to the drawing canvas and updates
 * the preview canvas with the masked image
 */
function applyMask() {
    // Get the image data for the drawing canvas.
    const idata = canvases.drawing.ctx.getImageData(0, 0, options.width, options.height);

    // Create a 32-bit array from the image data buffer.
    const data32 = new Uint32Array(idata.data.buffer);

    // Apply a left shift of 8 bits to each 32-bit value in the array.
    let i = 0, len = data32.length;
    while (i < len) data32[i] = data32[i++] << 8;

    // Update the preview canvas with the masked image data.
    canvases.preview.ctx.putImageData(idata, 0, 0);

    // Set the global composite operation to "source-in".
    canvases.preview.ctx.globalCompositeOperation = "source-in";

    // Draw the image on the preview canvas with the applied mask.
    canvases.preview.ctx.drawImage(elements.image, 0, 0);
}

// downloads the last image or mask
function downloadFile(type) {
    let canvas = canvases.preview.canvas;
    let name = "image.png"
    if (type === "mask") {
        canvas = canvases.drawing.canvas;
        name = "mask.png"
    }
    const link = document.createElement("a");
    link.download = name;
    link.href = canvas.toDataURL();
    link.click();
}

init();