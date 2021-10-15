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

export interface ImageSize {
    width: number;
    height: number;
}
interface DrawImageToCanvasOptions {
    canvas?: HTMLCanvasElement;
    imageSize: ImageSize;
}
export async function drawImageToCanvas(
    imageUrl: string,
    options: DrawImageToCanvasOptions
): Promise<HTMLCanvasElement> {
    const canvas = options.canvas || document.createElement('canvas');
    const image = await loadImage(imageUrl);
    resizeDrawToCanvas(image, canvas, {
        sourceSize: {
            width: image.width,
            height: image.height,
        },
        targetSize: {
            width: options.imageSize.width,
            height: options.imageSize.height,
        },
    });
    return canvas;
}

interface ResizeDrawToCanvasOptions {
    sourceSize: ImageSize;
    targetSize: ImageSize;
}
export function resizeDrawToCanvas(
    source: CanvasImageSource,
    canvas: HTMLCanvasElement,
    options: ResizeDrawToCanvasOptions
) {
    const { sourceSize, targetSize } = options;
    const hRatio = targetSize.width / sourceSize.width;
    const vRatio = targetSize.height / sourceSize.height;
    const ratio = Math.min(hRatio, vRatio);
    const drawWidth = sourceSize.width * ratio;
    const drwaHeight = sourceSize.height * ratio;
    const centerShift_x = (targetSize.width - drawWidth) / 2;
    const centerShift_y = (targetSize.height - drwaHeight) / 2;

    const context = canvas.getContext('2d')!;
    context.clearRect(0, 0, sourceSize.width, sourceSize.height);
    context.drawImage(
        source,
        0,
        0,
        sourceSize.width,
        sourceSize.height,
        centerShift_x,
        centerShift_y,
        drawWidth,
        drwaHeight
    );
}

interface CoverDrawToCanvasOptions {
    sourceSize: ImageSize;
    targetSize: ImageSize;
}
export function coverDrawToCanvas(
    source: CanvasImageSource,
    canvas: HTMLCanvasElement,
    options: CoverDrawToCanvasOptions
) {
    const { sourceSize, targetSize } = options;
    const hRatio = targetSize.width / sourceSize.width;
    const vRatio = targetSize.height / sourceSize.height;
    const ratio = Math.max(hRatio, vRatio);
    const drawWidth = sourceSize.width * ratio;
    const drwaHeight = sourceSize.height * ratio;
    const centerShift_x = (targetSize.width - drawWidth) / 2;
    const centerShift_y = (targetSize.height - drwaHeight) / 2;

    const context = canvas.getContext('2d')!;
    context.drawImage(
        source,
        0,
        0,
        sourceSize.width,
        sourceSize.height,
        centerShift_x,
        centerShift_y,
        drawWidth,
        drwaHeight
    );
}

export function canvasToArray(canvas: HTMLCanvasElement): Float32Array {
    const context = canvas.getContext('2d')!;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    return Float32Array.from(imageData.data.values());
}

/**
 *
 * @param data [h, w, c]
 * @param options ImageSize
 * @returns [batch, c, h, w]
 */
export function fromHWCToCHW(data: Float32Array, options: ImageSize): Float32Array {
    const { height, width } = options;
    const dataFromImage = ndarray(new Float32Array(data), [height, width, 4]);
    const dataProcessed = ndarray(new Float32Array(width * height * 3), [1, 3, height, width]);
    ops.divseq(dataFromImage, 255.0);
    ops.assign(dataProcessed.pick(0, 0, null, null), dataFromImage.pick(null, null, 0));
    ops.assign(dataProcessed.pick(0, 1, null, null), dataFromImage.pick(null, null, 1));
    ops.assign(dataProcessed.pick(0, 2, null, null), dataFromImage.pick(null, null, 2));

    return dataProcessed.data;
}
