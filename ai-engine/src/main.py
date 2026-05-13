from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import pytesseract

app = FastAPI(title="Smart Finance AI Engine")

# CẤU HÌNH ĐƯỜNG DẪN TESSERACT (Sửa lại nếu cài ở ổ đĩa khác)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Load mô hình YOLOv8
model = YOLO("models/best.pt") 

def preprocess_image_for_ocr(image):
    """Hàm tiền xử lý ảnh để Tesseract đọc chữ chuẩn hơn"""
    # 1. Phóng to ảnh gấp 2 lần (Interpolation Cubic giúp giữ nét chữ)
    image = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    
    # 2. Chuyển sang ảnh xám (Grayscale)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # 3. Tăng độ tương phản (Thresholding Otsu) - Biến nền thành trắng, chữ thành đen
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

        results = model.predict(img)
        
        detections = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                conf = box.conf[0].item()
                class_id = int(box.cls[0].item())
                class_name = model.names[class_id]
                
                # Cắt vùng ảnh chứa thông tin
                cropped_img = img[y1:y2, x1:x2]
                
                # Bỏ qua nếu vùng cắt bị lỗi (kích thước = 0)
                if cropped_img.size == 0:
                    continue
                
                # Đưa qua hàm tiền xử lý ảnh
                processed_img = preprocess_image_for_ocr(cropped_img)
                
                # Đọc chữ bằng Tesseract với cấu hình --psm 7 (Xem như 1 dòng text)
                custom_config = r'--oem 3 --psm 7'
                extracted_text = pytesseract.image_to_string(processed_img, lang='eng', config=custom_config).strip()
                
                detections.append({
                    "label": class_name,
                    "confidence": round(conf, 2),
                    "box": [x1, y1, x2, y2],
                    "text": extracted_text
                })

        return JSONResponse(content={"status": "success", "data": detections})

    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)