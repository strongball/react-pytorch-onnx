import torch
import torchvision.models as models
from models.WithSoftMax import CnnWithSoftMax
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("-o", "--output", help="Output file path", required=True)

def main():
    args = parser.parse_args()
    old_model = models.resnet50(pretrained=True)
    modelName = args.output
    model = CnnWithSoftMax(old_model)
    model.eval()
    print("Load model done")

    batch_size = 1
    x = torch.randn(batch_size, 3, 224, 224, requires_grad=True)
    torch.onnx.export(model,               # model being run
                    x,                         # model input (or a tuple for multiple inputs)
                    modelName,   # where to save the model (can be a file or file-like object)
                    export_params=True,        # store the trained parameter weights inside the model file
                    opset_version=7,          # the ONNX version to export the model to
                    do_constant_folding=True,  # whether to execute constant folding for optimization
                    input_names = ['input'],   # the model's input names
                    output_names = ['output'], # the model's output names
                    dynamic_axes={'input' : {0 : 'batch_size'},    # variable length axes
                                    'output' : {0 : 'batch_size'}})
    print("Done. File: {}".format(modelName))
if __name__ == '__main__':
    main()