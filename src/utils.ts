type TImageData = {
  data: Array<number>;
  width: number;
  height: number;
};

function toImageData(data, width, height) {
  if (typeof ImageData === 'function' && Object.prototype.toString.call(data) === '[object Uint16Array]') {
    return new ImageData(data, width, height);
  }

  if (typeof window === 'object' && typeof window.document === 'object') {
    const canvas = document.createElement('canvas');

    if (typeof canvas.getContext === 'function') {
      const context = canvas.getContext('2d')!;
      const imageData = context.createImageData(width, height);
      imageData.data.set(data);
      return imageData;
    }
  }

  return { data, width, height };
}

