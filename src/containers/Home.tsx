import React, { useEffect, useState, useRef } from 'react';
import { Tensor, InferenceSession } from 'onnxjs';
import { loadImage, imageToArray, fromHWCToCHW, ImageOptions } from '../utils/image';
import { topk, TopkResult } from '../utils/fns';

import ImageNetClassname from '../classname.json';

const imageOptions: ImageOptions = {
    width: 224,
    height: 224,
};
async function loadModel(path: Blob | string) {
    const session = new InferenceSession({});
    await session.loadModel(path as string);
    return session;
}
interface Props {}
const HomeContainer: React.FC<Props> = (props) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [url, setURL] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    const [topkResult, setTopkResult] = useState<TopkResult[]>([]);

    const sessionPromise = useRef<Promise<InferenceSession>>(
        loadModel(process.env.PUBLIC_URL + '/mobilenet_v3_small.onnx')
    );
    useEffect(() => {
        (async () => {
            if (!url) {
                return;
            }
            if (!sessionPromise.current) {
                alert('沒有選擇模型!');
                return;
            }
            setLoading(true);
            try {
                const session = await sessionPromise.current;
                const image = await loadImage(url);
                const arrImage = imageToArray(image, imageOptions);
                const imageCHW = fromHWCToCHW(arrImage, imageOptions);
                const inputTensor = new Tensor(imageCHW, 'float32', [1, 3, 224, 224]);
                const outputMap = await session.run([inputTensor]);
                const output: Float32Array = outputMap.values().next().value.data;
                const topk5 = topk(output);
                setTopkResult(topk5);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        })();
    }, [url]);

    const modelInputChange = async (files?: File[]) => {
        if (!files || files.length === 0) {
            return;
        }
        sessionPromise.current = loadModel(files[0]);
    };

    const inputChange = (files?: File[]) => {
        if (!files || files.length === 0) {
            return;
        }
        setURL(URL.createObjectURL(files[0]));
    };

    return (
        <div>
            <div>
                <span>更換模型</span>
                <input type="file" onChange={(e) => modelInputChange((e.target?.files as any) as File[])}></input>
            </div>
            <div>
                <span>選擇圖片</span>
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => inputChange((e.target?.files as any) as File[])}
                />
            </div>
            {loading && <div>Loading...</div>}
            <img ref={imgRef} id="img" width="224" height="224" src={url} />
            <div>
                {topkResult.map((item, index) => (
                    <div key={item.index}>
                        <span style={{ paddingRight: 8 }}>{index + 1}.</span>
                        <span>{ImageNetClassname[item.index.toString() as '0']}</span>
                        <span>({(item.value * 100).toFixed(2)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default HomeContainer;
