from ultralytics import YOLO
import torch

# MẸO ĐỂ FIX LỖI GPU RTX 30-Series:
# Tắt CuDNN sẽ ép PyTorch dùng thuật toán thuần của CUDA thay vì thư viện CuDNN bị lỗi
torch.backends.cudnn.enabled = False
torch.backends.cudnn.benchmark = False

def train_model():
    device = 0 if torch.cuda.is_available() else 'cpu'
    print(f"--- Đang train trên thiết bị: {device} (CuDNN Disabled) ---")

    model = YOLO('yolov8s.pt')

    model.train(
        data='datasets/data.yaml', 
        epochs=50, 
        imgsz=640,
        batch=2,           
        workers=0,         
        amp=False,
        optimizer='AdamW',
        lr0=0.001,
        device=device,
        project='models',
        name='receipt_recognition'
    )

if __name__ == '__main__':
    train_model()