"use strict";
const GREYSCALE_MAGNITUDE_ALPHA = 255;
class SobelFilter {
    kernelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    kernelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];
    imageData;
    greyscaleData;
    constructor(imageData) {
        this.imageData = imageData;
        this.greyscaleData = this.calcGrayscaleData(imageData);
    }
    highOrderPixelAt = function (data, width) {
        return (x, y, rgbIndex = 0) => {
            return data[((width * y) + x) * 4 + rgbIndex];
        };
    };
    troughPixels = (callback) => {
        const { width, height } = this.imageData;
        let y = 0;
        while (y < height) {
            let x = 0;
            while (x < width) {
                callback(x, y);
                x++;
            }
            y++;
        }
    };
    calcGrayscaleData = (imageData) => {
        const { data, width } = imageData;
        const grayscaleData = [];
        const pixelAt = this.highOrderPixelAt(data, width);
        this.troughPixels((x, y) => {
            const r = pixelAt(x, y, 0);
            const g = pixelAt(x, y, 1);
            const b = pixelAt(x, y, 2);
            const avg = (r + g + b) / 3;
            grayscaleData.push(avg, avg, avg, GREYSCALE_MAGNITUDE_ALPHA);
        });
        return grayscaleData;
    };
    calcPixel = (kernel, pixelAt, x, y) => {
        return ((kernel[0][0] * pixelAt(x - 1, y - 1)) +
            (kernel[0][1] * pixelAt(x, y - 1)) +
            (kernel[0][2] * pixelAt(x + 1, y - 1)) +
            (kernel[1][0] * pixelAt(x - 1, y)) +
            (kernel[1][1] * pixelAt(x, y)) +
            (kernel[1][2] * pixelAt(x + 1, y)) +
            (kernel[2][0] * pixelAt(x - 1, y + 1)) +
            (kernel[2][1] * pixelAt(x, y + 1)) +
            (kernel[2][2] * pixelAt(x + 1, y + 1)));
    };
    calcMagnitude = (pixelX, pixelY) => {
        return Math.sqrt((pixelX * pixelX) + (pixelY * pixelY)) >>> 0;
    };
    optimizeSobelDataArray = (sobelData) => {
        if (typeof Uint8ClampedArray === 'function') {
            return new Uint8ClampedArray(sobelData);
        }
        return sobelData;
    };
    calcSobelX = () => {
        const { kernelX } = this;
        const width = this.imageData.width;
        const pixelAt = this.highOrderPixelAt(this.greyscaleData, width);
        const sobelData = [];
        this.troughPixels((x, y) => {
            const pixelX = this.calcPixel(kernelX, pixelAt, x, y);
            const magnitude = this.calcMagnitude(pixelX, 0);
            sobelData.push(magnitude, magnitude, magnitude, GREYSCALE_MAGNITUDE_ALPHA);
        });
        return this.optimizeSobelDataArray(sobelData);
    };
    calcSobelY = () => {
        const { kernelY } = this;
        const width = this.imageData.width;
        const pixelAt = this.highOrderPixelAt(this.greyscaleData, width);
        const sobelData = [];
        this.troughPixels((x, y) => {
            const pixelY = this.calcPixel(kernelY, pixelAt, x, y);
            const magnitude = this.calcMagnitude(0, pixelY);
            sobelData.push(magnitude, magnitude, magnitude, GREYSCALE_MAGNITUDE_ALPHA);
        });
        return this.optimizeSobelDataArray(sobelData);
    };
    calcSobelXY = () => {
        const { kernelX, kernelY } = this;
        const width = this.imageData.width;
        const pixelAt = this.highOrderPixelAt(this.greyscaleData, width);
        const sobelData = [];
        this.troughPixels((x, y) => {
            const pixelX = this.calcPixel(kernelX, pixelAt, x, y);
            const pixelY = this.calcPixel(kernelY, pixelAt, x, y);
            const magnitude = this.calcMagnitude(pixelX, pixelY);
            sobelData.push(magnitude, magnitude, magnitude, GREYSCALE_MAGNITUDE_ALPHA);
        });
        return this.optimizeSobelDataArray(sobelData);
    };
}
//# sourceMappingURL=SobelFilter.js.map