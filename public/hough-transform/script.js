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
  const houghTransform = new HoughTransform(imageData);

  queueMicrotask(() => {
    const imageData = houghTransform.detectLines();
    const houghImageData = toImageData(imageData.data, width, height);

    const canvasHoughXY = document.getElementById('canvas-hough-lines');
    const contextSobelX = canvasHoughXY.getContext('2d');
    contextSobelX.imageSmoothingEnabled = false;
    canvasHoughXY.width = width;
    canvasHoughXY.height = height;
    contextSobelX.putImageData(houghImageData, 0, 0);
  });

  queueMicrotask(() => {
    const imageData = houghTransform.detectEdges();
    const houghImageData = toImageData(imageData.data, width, height);

    const canvasHoughXY = document.getElementById('canvas-hough-edges');
    const contextSobelX = canvasHoughXY.getContext('2d');
    contextSobelX.imageSmoothingEnabled = false;
    canvasHoughXY.width = width;
    canvasHoughXY.height = height;
    contextSobelX.putImageData(houghImageData, 0, 10);
  });

  queueMicrotask(() => {
    const imageData = houghTransform.detectCircles(0, 0);
    const houghImageData = toImageData(imageData.data, width, height);

    const canvasHoughXY = document.getElementById('canvas-hough-circles');
    const contextSobelX = canvasHoughXY.getContext('2d');
    contextSobelX.imageSmoothingEnabled = false;
    canvasHoughXY.width = width;
    canvasHoughXY.height = height;
    contextSobelX.putImageData(houghImageData, 0, 0);
  });
}

loadImage('../pexels-photo-3678799.jpeg');
