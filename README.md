# React with Onnx

### Create onnx model
將 PyTotch model 轉換成 onnx model.  
使用 ImageNet 預先訓練的 Resnet50 model.

``` sh
$ mkdir models
$ python ./onnx/convert.py -o models/resnet50.onnx
```

### Run React Web
``` sh
$ npm run start
```
