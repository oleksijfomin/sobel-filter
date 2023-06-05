type TGradient = {
    gx: number;
    gy: number;
};
type TCorner = {
    x: number;
    y: number;
    response: number;
};
declare class HarrisDetector {
    private imageData;
    private width;
    private height;
    constructor(imageData: TImageData);
    private grayscale;
    private computeGradients;
    private computeCornerResponse;
    private nonMaximumSuppression;
    getGradientImage(): TImageData;
    getCornerDetectionImage(): TImageData;
}
