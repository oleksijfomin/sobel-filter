declare class HoughTransform {
    protected imageData: TImageData;
    constructor(imageData: TImageData);
    applyTransform: () => TImageData;
    private grayscaleThreshold;
    private convertToGrayscale;
    detectEdges: () => TImageData;
    detectLines: () => TImageData;
    detectCircles(minRadius: any, maxRadius: any): TImageData;
}
