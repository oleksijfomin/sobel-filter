'use strict';

const fileInput = document.getElementById('file');

fileInput.onchange = function(event) {
  const url = window.URL.createObjectURL(event.target.files[0]);
  loadImage(url);
};

function loadImage(src) {
  const image = new Image();
  image.src = src;

  image.onload = drawImage;
}

function drawImage(event) {
  const image = event.target;
  const width = image.width;
  const height = image.height;

  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, width, height);
  const harrisDetector = new HarrisDetector(imageData);

  queueMicrotask(() => {
    const imageData = harrisDetector.getGradientImage();
    const houghImageData = toImageData(imageData.data, width, height);

    const canvasHoughXY = document.getElementById('harris-detector-gradients-xy');
    const contextSobelX = canvasHoughXY.getContext('2d');
    contextSobelX.imageSmoothingEnabled = false;
    canvasHoughXY.width = width;
    canvasHoughXY.height = height;
    contextSobelX.putImageData(houghImageData, 0, 0);
  });

  queueMicrotask(() => {
    const imageData = harrisDetector.getCornerDetectionImage();
    const houghImageData = toImageData(imageData.data, width, height);

    const canvasHoughXY = document.getElementById('harris-detector-corners');
    const contextSobelX = canvasHoughXY.getContext('2d');
    contextSobelX.imageSmoothingEnabled = false;
    canvasHoughXY.width = width;
    canvasHoughXY.height = height;
    contextSobelX.putImageData(houghImageData, 0, 10);
  });
}

loadImage('./Uzhgorod_Synagogue_RB.jpg');
