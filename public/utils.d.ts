type TImageData = {
    data: Array<number>;
    width: number;
    height: number;
};
declare function toImageData(data: any, width: any, height: any): ImageData | {
    data: any;
    width: any;
    height: any;
};
