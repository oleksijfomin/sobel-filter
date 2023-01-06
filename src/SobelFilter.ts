type TImageData = {
  data: Array<number>;
  width: number;
  height: number;
};
type TKernelX = [
  [-1,0,1],
  [-2,0,2],
  [-1,0,1]
];
type TKernelY = [
  [-1,-2,-1],
  [0,0,0],
  [1,2,1]
];
type TPixelAt = (x: number, y: number, rgbIndex?: number) => number;
const GREYSCALE_MAGNITUDE_ALPHA = 255;

class SobelFilter {
  protected kernelX: TKernelX = [
    [-1,0,1],
    [-2,0,2],
    [-1,0,1]
  ];
  protected kernelY: TKernelY = [
    [-1,-2,-1],
    [0,0,0],
    [1,2,1]
  ];
  protected imageData: TImageData;
  protected greyscaleData: number[];

  constructor(imageData: TImageData) {
    this.imageData = imageData;
    this.greyscaleData = this.calcGrayscaleData(imageData);
  }

  protected highOrderPixelAt = function(data: Uint8ClampedArray | Array<number>, width: number): TPixelAt {
    return (x: number, y: number, rgbIndex: number = 0): number => {
      return data[((width * y) + x) * 4 + rgbIndex];
    }
  }

  protected troughPixels = (callback: (x: number, y: number) => void) => {
    const { width, height } = this.imageData;

    let y = 0;
    while (y < height) {
      let x = 0;
      while (x < width) {
        callback(x, y)
        x++
      }
      y++
    }
  }

  protected calcGrayscaleData = (imageData: TImageData): number[] => {
    const { data, width } = imageData;

    const grayscaleData: number[] = [];
    const pixelAt = this.highOrderPixelAt(data, width);

    this.troughPixels((x, y) => {
      const r = pixelAt(x, y, 0);
      const g = pixelAt(x, y, 1);
      const b = pixelAt(x, y, 2);

      const avg = (r + g + b) / 3;
      grayscaleData.push(avg, avg, avg, GREYSCALE_MAGNITUDE_ALPHA);
    });

    return grayscaleData;
  }

  protected calcPixel = (kernel: TKernelX | TKernelY, pixelAt: TPixelAt, x: number, y: number): number => {
    return (
      (kernel[0][0] * pixelAt(x - 1, y - 1)) +
      (kernel[0][1] * pixelAt(x, y - 1)) +
      (kernel[0][2] * pixelAt(x + 1, y - 1)) +
      (kernel[1][0] * pixelAt(x - 1, y)) +
      (kernel[1][1] * pixelAt(x, y)) +
      (kernel[1][2] * pixelAt(x + 1, y)) +
      (kernel[2][0] * pixelAt(x - 1, y + 1)) +
      (kernel[2][1] * pixelAt(x, y + 1)) +
      (kernel[2][2] * pixelAt(x + 1, y + 1))
    )
  }

  protected calcMagnitude = (pixelX: number, pixelY: number): number => {
    return Math.sqrt((pixelX * pixelX) + (pixelY * pixelY)) >>> 0;
  };

  public applyKernelX = (): TImageData => {
    const { kernelX } = this;
    const width = this.imageData.width;
    const height = this.imageData.height;

    const pixelAt = this.highOrderPixelAt(this.greyscaleData, width);
    const sobelData: number[] = [];

    this.troughPixels((x, y) => {
      const pixelX = this.calcPixel(kernelX, pixelAt, x, y);
      const magnitude: number = this.calcMagnitude(pixelX, 0);
      sobelData.push(magnitude, magnitude, magnitude, GREYSCALE_MAGNITUDE_ALPHA);
    });

    return {
      data: sobelData,
      width,
      height,
    };
  };

  public applyKernelY = (): TImageData => {
    const { kernelY } = this;
    const width = this.imageData.width;
    const height = this.imageData.height;

    const pixelAt = this.highOrderPixelAt(this.greyscaleData, width);
    const sobelData: number[] = [];

    this.troughPixels((x, y) => {
      const pixelY = this.calcPixel(kernelY, pixelAt, x, y);
      const magnitude: number = this.calcMagnitude(0, pixelY);
      sobelData.push(magnitude, magnitude, magnitude, GREYSCALE_MAGNITUDE_ALPHA);
    });

    return {
      data: sobelData,
      width,
      height,
    };
  };

  public applyKernelXY = (): TImageData => {
    const { kernelX, kernelY } = this;
    const width = this.imageData.width;
    const height = this.imageData.height;

    const pixelAt = this.highOrderPixelAt(this.greyscaleData, width);
    const sobelData: number[] = [];

    this.troughPixels((x, y) => {
      const pixelX = this.calcPixel(kernelX, pixelAt, x, y);
      const pixelY = this.calcPixel(kernelY, pixelAt, x, y);
      const magnitude: number = this.calcMagnitude(pixelX, pixelY);
      sobelData.push(magnitude, magnitude, magnitude, GREYSCALE_MAGNITUDE_ALPHA);
    });

    return {
      data: sobelData,
      width,
      height,
    };
  };
}
