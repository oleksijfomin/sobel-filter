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
  const sobelFilter = new SobelFilter(imageData);

  queueMicrotask(() => {
    const imageData = sobelFilter.applyKernelX();
    const sobelImageDataX = toImageData(imageData.data, width, height);

    const canvasSobelX = document.getElementById('canvas-sobel-x');
    const contextSobelX = canvasSobelX.getContext('2d');
    contextSobelX.imageSmoothingEnabled = false;
    canvasSobelX.width = width;
    canvasSobelX.height = height;
    contextSobelX.putImageData(sobelImageDataX, 0, 0);
  });
  queueMicrotask(() => {
    const imageData = sobelFilter.applyKernelY();
    const sobelImageDataY = toImageData(imageData.data, width, height);

    const canvasSobelY = document.getElementById('canvas-sobel-y');
    const contextSobelY = canvasSobelY.getContext('2d');
    contextSobelY.imageSmoothingEnabled = false;
    canvasSobelY.width = width;
    canvasSobelY.height = height;
    contextSobelY.putImageData(sobelImageDataY, 0, 0);
  });
  queueMicrotask(() => {
    const imageData = sobelFilter.applyKernelXY();
    const sobelImageDataXY = toImageData(imageData.data, width, height);

    const canvasSobelXY = document.getElementById('canvas-sobel-xy');
    const contextSobelXY = canvasSobelXY.getContext('2d');
    contextSobelXY.imageSmoothingEnabled = false;
    canvasSobelXY.width = width;
    canvasSobelXY.height = height;
    contextSobelXY.putImageData(sobelImageDataXY, 0, 0);
  });
}

loadImage('../grinch.jpeg');
