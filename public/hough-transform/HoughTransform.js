"use strict";
class HoughTransform {
    imageData;
    constructor(imageData) {
        this.imageData = imageData;
    }
    applyTransform = () => {
        const { width, height } = this.imageData;
        const imagePixels = this.imageData.data;
        const rhoMax = Math.sqrt(width * width + height * height);
        const thetaMax = Math.PI;
        const rhoBins = Math.floor(rhoMax) + 1;
        const thetaBins = 180;
        const houghData = [];
        for (let i = 0; i < rhoBins * thetaBins; i++) {
            houghData.push(0);
        }
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const pixelIndex = (width * y + x) * 4;
                const r = imagePixels[pixelIndex];
                const g = imagePixels[pixelIndex + 1];
                const b = imagePixels[pixelIndex + 2];
                if (r < 128 && g < 128 && b < 128) {
                    for (let thetaIndex = 0; thetaIndex < thetaBins; thetaIndex++) {
                        const theta = thetaIndex * (thetaMax / thetaBins);
                        const rho = x * Math.cos(theta) + y * Math.sin(theta);
                        const rhoIndex = Math.floor(rho);
                        if (rhoIndex >= 0 && rhoIndex < rhoBins) {
                            houghData[rhoIndex * thetaBins + thetaIndex]++;
                        }
                    }
                }
            }
        }
        return {
            data: houghData,
            width: thetaBins,
            height: rhoBins,
        };
    };
    grayscaleThreshold = 128;
    convertToGrayscale = () => {
        const { width, height } = this.imageData;
        const imagePixels = this.imageData.data;
        const grayscaleData = [];
        for (let i = 0; i < width * height; i++) {
            const pixelIndex = i * 4;
            const r = imagePixels[pixelIndex];
            const g = imagePixels[pixelIndex + 1];
            const b = imagePixels[pixelIndex + 2];
            const average = (r + g + b) / 3;
            const grayscaleValue = average < this.grayscaleThreshold ? 0 : 255;
            grayscaleData.push(grayscaleValue, grayscaleValue, grayscaleValue, 255);
        }
        return {
            data: grayscaleData,
            width,
            height,
        };
    };
    detectEdges = () => {
        const grayscaleImage = this.convertToGrayscale();
        const { width, height } = grayscaleImage;
        const imagePixels = grayscaleImage.data;
        const edgeData = [];
        for (let i = 0; i < width * height; i++) {
            const pixelIndex = i * 4;
            const grayscaleValue = imagePixels[pixelIndex];
            const edgeValue = grayscaleValue === 0 ? 0 : 255;
            edgeData.push(edgeValue, edgeValue, edgeValue, 255);
        }
        return {
            data: edgeData,
            width,
            height,
        };
    };
    detectLines = () => {
        const imagePixels = this.imageData.data;
        const accumulator = {};
        const rhoResolution = 1;
        const thetaResolution = Math.PI / 180;
        const maxTheta = Math.PI;
        const numThetas = Math.ceil(maxTheta / thetaResolution);
        const numRhos = Math.ceil(Math.sqrt(this.imageData.width * this.imageData.width + this.imageData.height * this.imageData.height) / rhoResolution);
        for (let rhoIndex = 0; rhoIndex < numRhos; rhoIndex++) {
            for (let thetaIndex = 0; thetaIndex < numThetas; thetaIndex++) {
                accumulator[`${rhoIndex},${thetaIndex}`] = 0;
            }
        }
        for (let y = 0; y < this.imageData.height; y++) {
            for (let x = 0; x < this.imageData.width; x++) {
                const pixelIndex = (y * this.imageData.width + x) * 4;
                const pixelValue = imagePixels[pixelIndex];
                if (pixelValue === 255) {
                    for (let thetaIndex = 0; thetaIndex < numThetas; thetaIndex++) {
                        const theta = thetaIndex * thetaResolution;
                        const rho = x * Math.cos(theta) + y * Math.sin(theta);
                        const rhoIndex = Math.floor(rho / rhoResolution);
                        if (accumulator[`${rhoIndex},${thetaIndex}`] !== undefined) {
                            accumulator[`${rhoIndex},${thetaIndex}`]++;
                        }
                    }
                }
            }
        }
        let maxAccumulatorValue = 0;
        for (const key in accumulator) {
            if (accumulator[key] > maxAccumulatorValue) {
                maxAccumulatorValue = accumulator[key];
            }
        }
        const threshold = 0.8 * maxAccumulatorValue;
        const lines = [];
        for (const key in accumulator) {
            if (accumulator[key] >= threshold) {
                const [rhoIndex, thetaIndex] = key.split(',').map(Number);
                const rho = rhoIndex * rhoResolution;
                const theta = thetaIndex * thetaResolution;
                lines.push({ rho, theta });
            }
        }
        const lineImage = new ImageData(this.imageData.width, this.imageData.height);
        const linePixels = lineImage.data;
        for (let y = 0; y < this.imageData.height; y++) {
            for (let x = 0; x < this.imageData.width; x++) {
                const pixelIndex = (y * this.imageData.width + x) * 4;
                linePixels[pixelIndex] = 0;
                linePixels[pixelIndex + 1] = 0;
                linePixels[pixelIndex + 2] = 0;
                linePixels[pixelIndex + 3] = 255;
            }
        }
        for (const line of lines) {
            const { rho, theta } = line;
            for (let x = 0; x < this.imageData.width; x++) {
                const y = Math.round((rho - x * Math.cos(theta)) / Math.sin(theta));
                if (y >= 0 && y < this.imageData.height) {
                    const pixelIndex = (y * this.imageData.width + x) * 4;
                    linePixels[pixelIndex] = 255;
                    linePixels[pixelIndex + 1] = 255;
                    linePixels[pixelIndex + 2] = 255;
                    linePixels[pixelIndex + 3] = 255;
                }
            }
        }
        return {
            data: lineImage.data,
            width: this.imageData.width,
            height: this.imageData.height,
        };
    };
    detectCircles(minRadius, maxRadius) {
        const imagePixels = this.imageData.data;
        const accumulator = {};
        const radiusResolution = 1;
        for (let y = 0; y < this.imageData.height; y++) {
            for (let x = 0; x < this.imageData.width; x++) {
                for (let radius = minRadius; radius <= maxRadius; radius += radiusResolution) {
                    accumulator[`${x},${y},${radius}`] = 0;
                }
            }
        }
        for (let y = 0; y < this.imageData.height; y++) {
            for (let x = 0; x < this.imageData.width; x++) {
                const pixelIndex = (y * this.imageData.width + x) * 4;
                const pixelValue = imagePixels[pixelIndex];
                if (pixelValue === 255) {
                    for (let radius = minRadius; radius <= maxRadius; radius += radiusResolution) {
                        for (let theta = 0; theta < 360; theta++) {
                            const centerX = x - radius * Math.cos(theta * Math.PI / 180);
                            const centerY = y - radius * Math.sin(theta * Math.PI / 180);
                            if (centerX >= 0 && centerX < this.imageData.width && centerY >= 0 && centerY < this.imageData.height) {
                                accumulator[`${Math.round(centerX)},${Math.round(centerY)},${radius}`]++;
                            }
                        }
                    }
                }
            }
        }
        let maxAccumulatorValue = 0;
        for (const key in accumulator) {
            if (accumulator[key] > maxAccumulatorValue) {
                maxAccumulatorValue = accumulator[key];
            }
        }
        const threshold = 0.8 * maxAccumulatorValue;
        const circles = [];
        for (const key in accumulator) {
            if (accumulator[key] >= threshold) {
                const [centerX, centerY, radius] = key.split(',').map(Number);
                circles.push({ centerX, centerY, radius });
            }
        }
        const circleImage = new ImageData(this.imageData.width, this.imageData.height);
        const circlePixels = circleImage.data;
        for (let y = 0; y < this.imageData.height; y++) {
            for (let x = 0; x < this.imageData.width; x++) {
                const pixelIndex = (y * this.imageData.width + x) * 4;
                circlePixels[pixelIndex] = 0;
                circlePixels[pixelIndex + 1] = 0;
                circlePixels[pixelIndex + 2] = 0;
                circlePixels[pixelIndex + 3] = 255;
            }
        }
        for (const circle of circles) {
            const { centerX, centerY, radius } = circle;
            for (let theta = 0; theta < 360; theta++) {
                const x = centerX + radius * Math.cos(theta * Math.PI / 180);
                const y = centerY + radius * Math.sin(theta * Math.PI / 180);
                if (x >= 0 && x < this.imageData.width && y >= 0 && y < this.imageData.height) {
                    const pixelIndex = (Math.round(y) * this.imageData.width + Math.round(x)) * 4;
                    circlePixels[pixelIndex] = 255;
                    circlePixels[pixelIndex + 1] = 255;
                    circlePixels[pixelIndex + 2] = 255;
                    circlePixels[pixelIndex + 3] = 255;
                }
            }
        }
        return {
            data: circleImage.data,
            width: this.imageData.width,
            height: this.imageData.height,
        };
    }
}
//# sourceMappingURL=HoughTransform.js.map