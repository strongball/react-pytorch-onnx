import ndarray from 'ndarray';
import ops from 'ndarray-ops';

export function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.src = url;
        im.onload = () => {
            resolve(im);
        };
    });
}

export interface ImageOptions {
    width: number;
    height: number;
}
export function imageToArray(image: HTMLImageElement, options: ImageOptions): Uint8ClampedArray {
    const { width, height } = options;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    return imageData.data;
}

export function fromHWCToCHW(data: any, options: ImageOptions): Float32Array {
    const { width, height } = options;
    const dataFromImage = ndarray(new Float32Array(data), [width, height, 4]);
    const dataProcessed = ndarray(new Float32Array(width * height * 3), [1, 3, height, width]);
    ops.divseq(dataFromImage, 255.0);
    ops.assign(dataProcessed.pick(0, 0, null, null), dataFromImage.pick(null, null, 0));
    ops.assign(dataProcessed.pick(0, 1, null, null), dataFromImage.pick(null, null, 1));
    ops.assign(dataProcessed.pick(0, 2, null, null), dataFromImage.pick(null, null, 2));

    return (dataProcessed.data as any) as Float32Array;
}
