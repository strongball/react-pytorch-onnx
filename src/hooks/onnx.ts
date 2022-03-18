import { useCallback, useEffect, useRef, useState } from 'react';
import { Tensor, InferenceSession } from 'onnxruntime-web';

import { canvasToArray, fromHWCToCHW, ImageSize } from '../utils/image';
import { topk, TopkResult } from '../utils/fns';
import { loadModel } from '../utils/onnx';

interface OnnxHookParams {
    model?: string | File;
    imageOptions: ImageSize;
}
export function useOnnx({ model, imageOptions }: OnnxHookParams) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [topkResults, setTopkResults] = useState<TopkResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const sessionPromise = useRef<Promise<InferenceSession>>();

    useEffect(() => {
        if (model) {
            sessionPromise.current = loadModel(model);
        } else {
            sessionPromise.current = undefined;
        }
    }, [model]);

    const predit = useCallback(async () => {
        if (!sessionPromise.current) {
            alert('沒有選擇模型!');
            return;
        }
        setLoading(true);
        try {
            const session = await sessionPromise.current;
            const arrImage = canvasToArray(canvasRef.current!);
            const imageCHW = fromHWCToCHW(arrImage, imageOptions);
            const inputTensor = new Tensor('float32', imageCHW, [1, 3, 224, 224]);
            const outputMap = await session.run({ input: inputTensor });
            const topk5 = topk(outputMap.output.data as Float32Array);
            setTopkResults(topk5);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, []);
    return {
        canvasRef,
        loading,
        predit,
        topkResults,
    };
}
