# Computer Vision methods implementations in vanilla Javascript written in Typescript.

### Easy Run

1. Clone repository.
2. Go to `/public` directory.
3. Open `/index.html` file.

### Implementations

#### Sobel Filter
See `/src/sobel-filter/SobelFilter.ts` in Typescript
Javascript version bundled and included `/public/sobel-filter/SobelFilter.js`

#### Hough Transform
See `/src/hough-transform/HoughTransform.ts` in Typescript
Javascript version bundled and included `/public/hough-transform/HoughTransform.js`

#### Hough Transform
See `/src/harris-detector/HarrisDetector.ts` in Typescript
Javascript version bundled and included `/public/harris-detector/HarrisDetector.js`

### Quirks
Doesn't optimized for large image assets.
Canvas is super limited on read / write ops.
Consider batch processing if necessary.
For demo purpose only.

Credits to oleksii.fomin@uzhnu.edu.ua
