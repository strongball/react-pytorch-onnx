# React with Onnx

[DEMO PAGE](https://strongball.github.io/react-pytorch-onnx)  
有預先入載入mobilenet_v3_small，可以直接使用。
模型使用Imagenet訓練共1000種，可以參考`src/classname.json`。

可以從檔案選擇圖片或是從相機擷取影像。
* 從檔案 -> 上傳圖片 -> 顯示結果
* 從相機 -> 開始錄影 -> 拍照 -> 顯示結果
## Create onnx model
將 PyTotch model 轉換成 onnx model。
CNN模型最後添加上 `softmax` 在輸出結果以百分比呈現。
使用 ImageNet 預先訓練的 Resnet50 model.

``` sh
$ mkdir models
$ python ./onnx/convert.py -o models/resnet50.onnx
```

## Run React Web
``` sh
$ npm run start
```
