import torch
class CnnWithSoftMax(torch.nn.Module):
    def __init__(self, cnn_model):
        super(CnnWithSoftMax, self).__init__()
        self.cnn_model = cnn_model
        self.softmax = torch.nn.Softmax(dim=1)
    def forward(self, input):
        output = self.cnn_model(input)
        output = self.softmax(output)
        return output