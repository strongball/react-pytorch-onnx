import React, { useEffect, useState, useRef } from 'react';
import { Tensor, InferenceSession } from 'onnxjs';
import { loadImage, imageToArray, fromHWCToCHW, ImageOptions } from '../utils/image';
import { topk, TopkResult } from '../utils/fns';

import ImageNetClassname from '../classname.json';

const imageOptions: ImageOptions = {
    width: 224,
    height: 224,
};
async function loadModel() {
    const session = new InferenceSession({});
    await session.loadModel('./resnet50_prob.onnx');
    return session;
}
interface Props {}
const HomeContainer: React.FC<Props> = (props) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [url, setURL] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    const [topkResult, setTopkResult] = useState<TopkResult[]>([]);

    const sessionPromise = useRef<Promise<InferenceSession>>(loadModel());
    useEffect(() => {
        (async () => {
            if (!url) {
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
    const inputChange = (files?: File[]) => {
        if (!files || files.length === 0) {
            return;
        }
        setURL(URL.createObjectURL(files[0]));
    };

    return (
        <div>
            {loading && <div>Loading...</div>}
            <div>
                {topkResult.map((item, index) => (
                    <div key={item.index}>
                        <span style={{ paddingRight: 8 }}>{index + 1}.</span>
                        <span>{ImageNetClassname[item.index.toString() as '0']}</span>
                        <span>({(item.value * 100).toFixed(2)})</span>
                    </div>
                ))}
            </div>
            <input type="file" onChange={(e) => inputChange((e.target?.files as any) as File[])}></input>
            <img ref={imgRef} id="img" width="224" height="224" src={url} />
        </div>
    );
};
export default HomeContainer;
