type TImageData = {
    data: Array<number>;
    width: number;
    height: number;
};
type TKernelX = [
    [
        -1,
        0,
        1
    ],
    [
        -2,
        0,
        2
    ],
    [
        -1,
        0,
        1
    ]
];
type TKernelY = [
    [
        -1,
        -2,
        -1
    ],
    [
        0,
        0,
        0
    ],
    [
        1,
        2,
        1
    ]
];
type TPixelAt = (x: number, y: number, rgbIndex?: number) => number;
declare const GREYSCALE_MAGNITUDE_ALPHA = 255;
declare class SobelFilter {
    protected kernelX: TKernelX;
    protected kernelY: TKernelY;
    protected imageData: TImageData;
    protected greyscaleData: number[];
    constructor(imageData: TImageData);
    protected highOrderPixelAt: (data: Uint8ClampedArray | Array<number>, width: number) => TPixelAt;
    protected troughPixels: (callback: (x: number, y: number) => void) => void;
    protected calcGrayscaleData: (imageData: TImageData) => number[];
    protected calcPixel: (kernel: TKernelX | TKernelY, pixelAt: TPixelAt, x: number, y: number) => number;
    protected calcMagnitude: (pixelX: number, pixelY: number) => number;
    applyKernelX: () => TImageData;
    applyKernelY: () => TImageData;
    applyKernelXY: () => TImageData;
}
