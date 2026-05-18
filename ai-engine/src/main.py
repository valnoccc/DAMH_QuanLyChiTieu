import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image

# Import VietOCR thay cho pytesseract
from vietocr.tool.predictor import Predictor
from vietocr.tool.config import Cfg

# Import hàm gióng trục Y từ file predict.py
from src.predict import find_matching_amount_box

app = FastAPI(title="Smart Finance AI Engine")

# ==========================================
# KHỞI TẠO CÁC MÔ HÌNH AI (Chạy 1 lần khi bật server)
# ==========================================
# 1. Load YOLOv8 V2
model = YOLO("models/best_v4_2.pt") 

# 2. Load VietOCR (Sử dụng kiến trúc vgg_transformer chuyên tiếng Việt)
print("Đang nạp mô hình VietOCR...")
config = Cfg.load_config_from_name('vgg_transformer')
# Lưu ý: Nếu máy bạn chạy báo lỗi thiếu RAM/VRAM, hãy đổi 'cpu' thành 'cuda:0' (nếu có GPU) 
# hoặc đổi 'vgg_transformer' thành 'vgg_seq2seq' cho nhẹ hơn.
config['device'] = 'cpu' 
vietocr_predictor = Predictor(config)
print("Nạp VietOCR thành công!")

@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI Engine is running with YOLO & VietOCR!"}

@app.post("/predict")
async def predict_receipt(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Chạy YOLO dự đoán
        results = model.predict(img)
        boxes = results[0].boxes
        class_names = results[0].names
        
        detections = []

        # ==========================================
        # PHẦN 1: XỬ LÝ CÁC NHÃN BÌNH THƯỜNG (Store, Date...)
        # ==========================================
        for box in boxes:
            conf = box.conf[0].item()
            class_id = int(box.cls[0].item())
            class_name = class_names[class_id]
            
            # Bỏ qua các nhãn liên quan đến Tổng tiền, chúng ta sẽ xử lý riêng
            if class_name in ["label_total", "amount_number", "Total_Amount"]:
                continue
                
            x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
            
            # Cắt ảnh
            cropped_img = img[max(0, y1):y2, max(0, x1):x2]
            
            if cropped_img.size == 0:
                continue
                
            # ĐIỂM KHÁC BIỆT: VietOCR dùng định dạng ảnh PIL (RGB) thay vì OpenCV (BGR)
            cropped_img_rgb = cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(cropped_img_rgb)
            
            # Đọc chữ bằng VietOCR
            extracted_text = vietocr_predictor.predict(pil_img)
            
            detections.append({
                "label": class_name,
                "confidence": round(conf, 2),
                "box": [x1, y1, x2, y2],
                "text": extracted_text.strip()
            })

        # ==========================================
        # PHẦN 2: XỬ LÝ RIÊNG TỔNG TIỀN (Gióng trục Y)
        # ==========================================
        correct_amount_box = find_matching_amount_box(boxes, class_names)

        if correct_amount_box is not None:
            x1, y1, x2, y2 = map(int, correct_amount_box)
            
            # Cắt ảnh có thêm padding để không bị mất viền số
            padding = 5
            cropped_img = img[max(0, y1-padding) : y2+padding, max(0, x1-padding) : x2+padding]
            
            if cropped_img.size != 0:
                # Ép sang PIL Image cho VietOCR
                cropped_img_rgb = cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(cropped_img_rgb)
                
                # Đọc chữ bằng VietOCR
                extracted_text = vietocr_predictor.predict(pil_img)
                
                # Nạp kết quả Tổng tiền đã chốt vào danh sách trả về
                detections.append({
                    "label": "Total_Amount",
                    "confidence": 1.0, 
                    "box": [x1, y1, x2, y2],
                    "text": extracted_text.strip()
                })

        return JSONResponse(content={"status": "success", "data": detections})

    except Exception as e:
        return JSONResponse(
            content={"status": "error", "message": str(e)},
            status_code=500
        )