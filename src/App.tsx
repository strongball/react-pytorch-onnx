import React, { useEffect } from 'react';
import logo from './logo.svg';
import HomeContainer from './containers/Home';
import { Tensor, InferenceSession } from 'onnxjs';
import ndarray from 'ndarray';
import ops from 'ndarray-ops';

// const image = new Image();
// image.src = './dog.jpg';
// image.onload = () => {
//     console.log('onload');
// };
const App: React.FC = () => {
    // const session = new InferenceSession();
    // useEffect(() => {
    //     (async () => {
    //         await session.loadModel('./model.onnx');
    //         const data = getImageData();
    //         const pData = preprocess(data).data;
    //         const inputTensor = new onnx.Tensor(pData as any, 'float32', [1, 3, 224, 224]);
    //         const outputMap = await session.run([inputTensor]);
    //         const outputData = outputMap.values().next().value.data;
    //         console.log(outputData.indexOf(Math.max(...outputData)));
    //         console.log(outputData);
    //     })();
    //     // loadMobileNet();
    // }, []);
    return (
        <div className="App">
            <HomeContainer></HomeContainer>
        </div>
    );
};

// function getImageData(modelWidth = 224, modelHeight = 224) {
//     const canvas = document.createElement('canvas');
//     canvas.width = modelWidth;
//     canvas.height = modelHeight;
//     const context = canvas.getContext('2d')!;
//     context.drawImage(image, 0, 0);

//     const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//     return imageData.data;
// }

// function preprocess(data: any, width = 224, height = 224) {
//     const dataFromImage = ndarray(new Float32Array(data), [width, height, 4]);
//     const dataProcessed = ndarray(new Float32Array(width * height * 3), [1, 3, height, width]);

//     ops.divseq(dataFromImage, 255.0);
//     ops.assign(dataProcessed.pick(0, 0, null, null), dataFromImage.pick(null, null, 0));
//     ops.assign(dataProcessed.pick(0, 1, null, null), dataFromImage.pick(null, null, 1));
//     ops.assign(dataProcessed.pick(0, 2, null, null), dataFromImage.pick(null, null, 2));

//     return dataProcessed;
// }
export default App;
