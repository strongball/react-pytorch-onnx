# React with Onnx

[DEMO PAGE](https://strongball.github.io/react-pytorch-onnx)  
有預先入載入mobilenet_v3_small，可以直接使用。
## Create onnx model
將 PyTotch model 轉換成 onnx model.  
使用 ImageNet 預先訓練的 Resnet50 model.

``` sh
$ mkdir models
$ python ./onnx/convert.py -o models/resnet50.onnx
```

## Run React Web
``` sh
$ npm run start
```
