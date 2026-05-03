from ultralytics import YOLO
import torch

def train_model():
    # Kiểm tra GPU
    device = 0 if torch.cuda.is_available() else 'cpu'
    print(f"--- Đang train trên thiết bị: {device} ---")

    # Tải model YOLOv8 nano (nhẹ nhất, hợp với GTX 1650)
    model = YOLO('yolov8n.pt')

    # Bắt đầu huấn luyện
    model.train(
        data='datasets/data.yaml', 
        epochs=50, 
        imgsz=640, 
        batch=8,           # 4GB VRAM của 1650 nên để mức 8 cho an toàn
        device=device,
        project='models',
        name='receipt_recognition'
    )

if __name__ == '__main__':
    train_model()