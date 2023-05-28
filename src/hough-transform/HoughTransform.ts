class HoughTransform {
  protected imageData: TImageData;

  constructor(imageData: TImageData) {
    this.imageData = imageData;
  }

  public applyTransform = (): TImageData => {
    const { width, height } = this.imageData;
    const imagePixels = this.imageData.data;

    const rhoMax = Math.sqrt(width * width + height * height);
    const thetaMax = Math.PI;
    const rhoBins = Math.floor(rhoMax) + 1;
    const thetaBins = 180;
    const houghData: number[] = [];

    // Initialize houghData array
    for (let i = 0; i < rhoBins * thetaBins; i++) {
      houghData.push(0);
    }

    // Perform Hough Transform
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const pixelIndex = (width * y + x) * 4;
        const r = imagePixels[pixelIndex];
        const g = imagePixels[pixelIndex + 1];
        const b = imagePixels[pixelIndex + 2];

        // Perform edge detection based on RGB threshold
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

  private grayscaleThreshold = 128;

  private convertToGrayscale = (): TImageData => {
    const { width, height } = this.imageData;
    const imagePixels = this.imageData.data;
    const grayscaleData: number[] = [];

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

  // private addNoise = (level: number): TImageData => {
  //   const { width, height } = this.imageData;
  //   const imagePixels = this.imageData.data;
  //   const noisyData: number[] = [];
  //
  //   for (let i = 0; i < width * height; i++) {
  //     const pixelIndex = i * 4;
  //     const grayscaleValue = imagePixels[pixelIndex];
  //
  //     const noise = Math.random() < level ? 255 - grayscaleValue : 0;
  //     const noisyValue = grayscaleValue + noise;
  //
  //     noisyData.push(noisyValue, noisyValue, noisyValue, 255);
  //   }
  //
  //   return {
  //     data: noisyData,
  //     width,
  //     height,
  //   };
  // };

  public detectEdges = (): TImageData => {
    const grayscaleImage = this.convertToGrayscale();
    const { width, height } = grayscaleImage;
    const imagePixels = grayscaleImage.data;
    const edgeData: number[] = [];

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

  public detectLines = (): TImageData => {
    const imagePixels = this.imageData.data;
    const accumulator = {}; // Stores the accumulator values for each (rho, theta) combination

    // Define the parameters for the Hough Transform
    const rhoResolution = 1;
    const thetaResolution = Math.PI / 180;

    const maxTheta = Math.PI;
    const numThetas = Math.ceil(maxTheta / thetaResolution);
    const numRhos = Math.ceil(Math.sqrt(this.imageData.width * this.imageData.width + this.imageData.height * this.imageData.height) / rhoResolution);

    // Initialize the accumulator with zeros
    for (let rhoIndex = 0; rhoIndex < numRhos; rhoIndex++) {
      for (let thetaIndex = 0; thetaIndex < numThetas; thetaIndex++) {
        accumulator[`${rhoIndex},${thetaIndex}`] = 0;
      }
    }

    // Perform Hough Transform
    for (let y = 0; y < this.imageData.height; y++) {
      for (let x = 0; x < this.imageData.width; x++) {
        const pixelIndex = (y * this.imageData.width + x) * 4;
        const pixelValue = imagePixels[pixelIndex];

        if (pixelValue === 255) { // Edge pixel found
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

    // Find the maximum accumulator value
    let maxAccumulatorValue = 0;
    for (const key in accumulator) {
      if (accumulator[key] > maxAccumulatorValue) {
        maxAccumulatorValue = accumulator[key];
      }
    }

    // Set a threshold for line detection (80% of the maximum accumulator value)
    const threshold = 0.8 * maxAccumulatorValue;

    // Extract lines based on the threshold
    const lines = [];
    for (const key in accumulator) {
      if (accumulator[key] >= threshold) {
        const [rhoIndex, thetaIndex] = key.split(',').map(Number);
        const rho = rhoIndex * rhoResolution;
        const theta = thetaIndex * thetaResolution;

        // @ts-ignore
        lines.push({ rho, theta });
      }
    }

    // Render the detected lines on a new image
    const lineImage = new ImageData(this.imageData.width, this.imageData.height);
    const linePixels = lineImage.data;

    for (let y = 0; y < this.imageData.height; y++) {
      for (let x = 0; x < this.imageData.width; x++) {
        const pixelIndex = (y * this.imageData.width + x) * 4;
        linePixels[pixelIndex] = 0; // Set red channel to 0 (black pixel)
        linePixels[pixelIndex + 1] = 0; // Set green channel to 0 (black pixel)
        linePixels[pixelIndex + 2] = 0; // Set blue channel to 0 (black pixel)
        linePixels[pixelIndex + 3] = 255; // Set alpha channel to 255 (opaque pixel)
      }
    }

    for (const line of lines) {
      const { rho, theta } = line;

      for (let x = 0; x < this.imageData.width; x++) {
        const y = Math.round((rho - x * Math.cos(theta)) / Math.sin(theta));

        if (y >= 0 && y < this.imageData.height) {
          const pixelIndex = (y * this.imageData.width + x) * 4;
          linePixels[pixelIndex] = 255; // Set red channel to 255 (white pixel)
          linePixels[pixelIndex + 1] = 255; // Set green channel to 255 (white pixel)
          linePixels[pixelIndex + 2] = 255; // Set blue channel to 255 (white pixel)
          linePixels[pixelIndex + 3] = 255; // Set alpha channel to 255 (opaque pixel)
        }
      }
    }

    return {
      data: lineImage.data as unknown as number[],
      width: this.imageData.width,
      height: this.imageData.height,
    };
  };

  // public detectLinesWithNoise = (noiseLevel: number): TImageData => {
  //   const noisyImage = this.addNoise(noiseLevel);
  //   const edgeImage = this.detectEdges();
  //
  //   // Perform Hough Transform on the noisy image to detect lines
  //   // ...
  //   // Implement your line detection algorithm here
  //   // ...
  //
  //   // Placeholder code to return the same image as input
  //   return edgeImage;
  // };
  //
  // public detectLinesOnRealImages = (images: TImageData[]): TImageData[] => {
  //   const edgeImages: TImageData[] = [];
  //
  //   for (const image of images) {
  //     const grayscaleImage = this.convertToGrayscale(image);
  //     const edgeImage = this.detectEdges(grayscaleImage);
  //
  //     // Perform Hough Transform on the grayscale image to detect lines
  //     // ...
  //     // Implement your line detection algorithm here
  //     // ...
  //
  //     // Placeholder code to return the same image as input
  //     edgeImages.push(edgeImage);
  //   }
  //
  //   return edgeImages;
  // };
  //
  detectCircles(minRadius, maxRadius): TImageData {
    const imagePixels = this.imageData.data;
    const accumulator = {}; // Stores the accumulator values for each (x, y, radius) combination

    // Define the parameters for the Hough Transform
    const radiusResolution = 1;

    // Initialize the accumulator with zeros
    for (let y = 0; y < this.imageData.height; y++) {
      for (let x = 0; x < this.imageData.width; x++) {
        for (let radius = minRadius; radius <= maxRadius; radius += radiusResolution) {
          accumulator[`${x},${y},${radius}`] = 0;
        }
      }
    }

    // Perform Hough Transform
    for (let y = 0; y < this.imageData.height; y++) {
      for (let x = 0; x < this.imageData.width; x++) {
        const pixelIndex = (y * this.imageData.width + x) * 4;
        const pixelValue = imagePixels[pixelIndex];

        if (pixelValue === 255) { // Edge pixel found
          for (let radius = minRadius; radius <= maxRadius; radius += radiusResolution) {
            for (let theta = 0; theta < 360; theta++) {
              const centerX = x - radius * Math.cos(theta * Math.PI / 180);
              const centerY = y - radius * Math.sin(theta * Math.PI / 180);

              if (centerX >= 0 && centerX < this.imageData.width && centerY >= 0 && centerY < this.imageData.height) {
                // const centerPixelIndex = (Math.round(centerY) * this.imageData.width + Math.round(centerX)) * 4;
                accumulator[`${Math.round(centerX)},${Math.round(centerY)},${radius}`]++;
              }
            }
          }
        }
      }
    }

    // Find the maximum accumulator value
    let maxAccumulatorValue = 0;
    for (const key in accumulator) {
      if (accumulator[key] > maxAccumulatorValue) {
        maxAccumulatorValue = accumulator[key];
      }
    }

    // Set a threshold for circle detection (80% of the maximum accumulator value)
    const threshold = 0.8 * maxAccumulatorValue;

    // Extract circles based on the threshold
    const circles = [];
    for (const key in accumulator) {
      if (accumulator[key] >= threshold) {
        const [centerX, centerY, radius] = key.split(',').map(Number);
        // @ts-ignore
        circles.push({ centerX, centerY, radius });
      }
    }

    // Render the detected circles on a new image
    const circleImage = new ImageData(this.imageData.width, this.imageData.height);
    const circlePixels = circleImage.data;

    for (let y = 0; y < this.imageData.height; y++) {
      for (let x = 0; x < this.imageData.width; x++) {
        const pixelIndex = (y * this.imageData.width + x) * 4;
        circlePixels[pixelIndex] = 0; // Set red channel to 0 (black pixel)
        circlePixels[pixelIndex + 1] = 0; // Set green channel to 0 (black pixel)
        circlePixels[pixelIndex + 2] = 0; // Set blue channel to 0 (black pixel)
        circlePixels[pixelIndex + 3] = 255; // Set alpha channel to 255 (opaque pixel)
      }
    }

    for (const circle of circles) {
      const { centerX, centerY, radius } = circle;

      for (let theta = 0; theta < 360; theta++) {
        const x = centerX + radius * Math.cos(theta * Math.PI / 180);
        const y = centerY + radius * Math.sin(theta * Math.PI / 180);

        if (x >= 0 && x < this.imageData.width && y >= 0 && y < this.imageData.height) {
          const pixelIndex = (Math.round(y) * this.imageData.width + Math.round(x)) * 4;
          circlePixels[pixelIndex] = 255; // Set red channel to 255 (white pixel)
          circlePixels[pixelIndex + 1] = 255; // Set green channel to 255 (white pixel)
          circlePixels[pixelIndex + 2] = 255; // Set blue channel to 255 (white pixel)
          circlePixels[pixelIndex + 3] = 255; // Set alpha channel to 255 (opaque pixel)
        }
      }
    }

    return {
      data: circleImage.data as unknown as number[],
      width: this.imageData.width,
      height: this.imageData.height,
    };
  }

  //
  // public detectCirclesWithNoise = (noiseLevel: number): TImageData => {
  //   const noisyImage = this.addNoise(noiseLevel);
  //   const grayscaleImage = this.convertToGrayscale(noisyImage);
  //   const { width, height } = grayscaleImage;
  //   const imagePixels = grayscaleImage.data;
  //   const circleData: number[] = [];
  //
  //   // Perform Hough Transform on the noisy grayscale image to detect circles
  //   // ...
  //   // Implement your circle detection algorithm here
  //   // ...
  //
  //   // Placeholder code to return the same image as input
  //   return {
  //     data: imagePixels,
  //     width,
  //     height,
  //   };
  // };
  //
  // public detectCirclesOnRealImages = (images: TImageData[]): TImageData[] => {
  //   const circleImages: TImageData[] = [];
  //
  //   for (const image of images) {
  //     const grayscaleImage = this.convertToGrayscale(image);
  //     const { width, height } = grayscaleImage;
  //     const imagePixels = grayscaleImage.data;
  //     const circleData: number[] = [];
  //
  //     // Perform Hough Transform on the grayscale image to detect circles
  //     // ...
  //     // Implement your circle detection algorithm here
  //     // ...
  //
  //     // Placeholder code to return the same image as input
  //     circleImages.push({
  //       data: imagePixels,
  //       width,
  //       height,
  //     });
  //   }
  //
  //   return circleImages;
  // };
}
