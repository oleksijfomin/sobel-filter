"use strict";
class HarrisDetector {
    imageData;
    width;
    height;
    constructor(imageData) {
        this.imageData = imageData;
        this.width = imageData.width;
        this.height = imageData.height;
    }
    grayscale() {
        const { data } = this.imageData;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = Math.round((r + g + b) / 3);
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }
    }
    computeGradients() {
        const { data } = this.imageData;
        const gradients = [];
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const pixelIndex = y * this.width + x;
                const gx = data[(pixelIndex + 1) * 4] - data[(pixelIndex - 1) * 4];
                const gy = data[(pixelIndex + this.width) * 4] -
                    data[(pixelIndex - this.width) * 4];
                gradients[pixelIndex] = { gx, gy };
            }
        }
        return gradients;
    }
    computeCornerResponse(gradients, k = 0.04) {
        const cornerResponse = [];
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const pixelIndex = y * this.width + x;
                const { gx, gy } = gradients[pixelIndex];
                const det = gx * gx * gy * gy - gx * gy * gx * gy;
                const trace = gx * gx + gy * gy;
                cornerResponse[pixelIndex] =
                    det - k * trace * trace;
            }
        }
        return cornerResponse;
    }
    nonMaximumSuppression(cornerResponse, threshold = 100) {
        const corners = [];
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const pixelIndex = y * this.width + x;
                const response = cornerResponse[pixelIndex];
                if (response > threshold) {
                    let isMax = true;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const neighborIndex = pixelIndex + dy * this.width + dx;
                            if (cornerResponse[neighborIndex] > response) {
                                isMax = false;
                                break;
                            }
                        }
                        if (!isMax)
                            break;
                    }
                    if (isMax) {
                        corners.push({ x, y, response });
                    }
                }
            }
        }
        return corners;
    }
    getGradientImage() {
        this.grayscale();
        const gradients = this.computeGradients();
        const { data } = this.imageData;
        for (let i = 0; i < gradients.length; i++) {
            const gradient = gradients[i];
            if (!gradient)
                continue;
            const { gx, gy } = gradient;
            const pixelIndex = i * 4;
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            data[pixelIndex] = Math.abs(gx);
            data[pixelIndex + 1] = Math.abs(gy);
            data[pixelIndex + 2] = Math.abs(magnitude);
            data[pixelIndex + 3] = 255;
        }
        return this.imageData;
    }
    getCornerDetectionImage() {
        this.grayscale();
        const gradients = this.computeGradients();
        const cornerResponse = this.computeCornerResponse(gradients);
        const corners = this.nonMaximumSuppression(cornerResponse);
        const { data } = this.imageData;
        for (let i = 0; i < corners.length; i++) {
            const { x, y } = corners[i];
            const pixelIndex = (y * this.width + x) * 4;
            data[pixelIndex] = 255;
            data[pixelIndex + 1] = 0;
            data[pixelIndex + 2] = 0;
            data[pixelIndex + 3] = 255;
        }
        return this.imageData;
    }
}
//# sourceMappingURL=HarrisDetector.js.map