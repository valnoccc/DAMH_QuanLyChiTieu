from ultralytics import YOLO

# Load file model cần kiểm tra
model = YOLO("models/best.pt") 

# In ra danh sách các nhãn mà model này đã được học
print("Danh sách Class:", model.names)