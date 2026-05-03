from fastapi import FastAPI, UploadFile, File
import uvicorn
from ultralytics import YOLO
from dotenv import load_dotenv
import os
import shutil

load_dotenv() # Load biến môi trường từ .env

app = FastAPI(title="Smart Finance AI OCR")

# Load model - ưu tiên file đã train xong (best.pt)
MODEL_PATH = os.getenv("MODEL_PATH", "models/receipt_recognition/weights/best.pt")
if not os.path.exists(MODEL_PATH):
    print(f"⚠️ Không tìm thấy {MODEL_PATH}, dùng model mặc định để test.")
    MODEL_PATH = "yolov8n.pt"

model = YOLO(MODEL_PATH)

@app.post("/scan-receipt")
async def scan_receipt(file: UploadFile = File(...)):
    # 1. Lưu file tạm để xử lý
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Chạy model dự đoán
    results = model.predict(source=temp_path, save=False, conf=0.25)
    
    # 3. Logic bóc tách dữ liệu (Tạm thời trả về giả lập để bạn làm Backend trước)
    # Sau khi train xong, bạn sẽ viết code đọc tọa độ từ kết quả này
    response_data = {
        "status": "success",
        "data": {
            "storeName": "Highlands Coffee", # Giả lập
            "totalAmount": 55000,           # Giả lập
            "date": "2026-05-02"             # Giả lập
        }
    }
    
    # Xóa file tạm sau khi xong
    if os.path.exists(temp_path):
        os.remove(temp_path)
        
    return response_data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))