from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import pytesseract

# Import hàm gióng trục Y từ file predict.py
from src.predict import find_matching_amount_box

app = FastAPI(title="Smart Finance AI Engine")

# CẤU HÌNH ĐƯỜNG DẪN TESSERACT (Sửa lại nếu cài ở ổ đĩa khác)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Load mô hình YOLOv8 V2 (Phiên bản có 2 nhãn label_total và amount_number)
model = YOLO("models/best_v3_2.pt") 

def preprocess_image_for_ocr(image):
    """Hàm tiền xử lý ảnh để Tesseract đọc chữ chuẩn hơn"""
    image = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh

@app.get("/")
def read_root():
    return {"message": "AI Engine is running!"}

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
            if class_name in ["label_total", "amount_number"]:
                continue
                
            x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
            cropped_img = img[y1:y2, x1:x2]
            
            if cropped_img.size == 0:
                continue
                
            processed_img = preprocess_image_for_ocr(cropped_img)
            custom_config = r'--oem 3 --psm 7'
            extracted_text = pytesseract.image_to_string(processed_img, lang='eng', config=custom_config).strip()
            
            detections.append({
                "label": class_name,
                "confidence": round(conf, 2),
                "box": [x1, y1, x2, y2],
                "text": extracted_text
            })

        # ==========================================
        # PHẦN 2: XỬ LÝ RIÊNG TỔNG TIỀN (Gióng trục Y)
        # ==========================================
        correct_amount_box = find_matching_amount_box(boxes, class_names)

        if correct_amount_box is not None:
            x1, y1, x2, y2 = map(int, correct_amount_box)
            
            # Cắt ảnh có thêm padding để không bị mất viền số
            padding = 3
            cropped_img = img[max(0, y1-padding) : y2+padding, max(0, x1-padding) : x2+padding]
            
            if cropped_img.size != 0:
                processed_img = preprocess_image_for_ocr(cropped_img)
                custom_config = r'--oem 3 --psm 7'
                extracted_text = pytesseract.image_to_string(processed_img, lang='eng', config=custom_config).strip()
                
                # Nạp kết quả Tổng tiền đã chốt vào danh sách trả về
                detections.append({
                    "label": "Total_Amount",
                    "confidence": 1.0, 
                    "box": [x1, y1, x2, y2],
                    "text": extracted_text
                })

        return JSONResponse(content={"status": "success", "data": detections})

    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)