import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import pytesseract
from PIL import Image
from vietocr.tool.predictor import Predictor
from vietocr.tool.config import Cfg

app = FastAPI(title="Smart Finance AI Engine")

# CORS — cho phép backend NestJS và frontend React gọi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------
# CẤU HÌNH TESSERACT VÀ VIETOCR
# ---------------------------------------------------------------
TESSERACT_PATH = os.environ.get(
    "TESSERACT_CMD",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)
if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

# Khởi tạo VietOCR
print("Loading VietOCR model (vgg_transformer)...")
vietocr_config = Cfg.load_config_from_name('vgg_transformer')
vietocr_config['device'] = 'cpu' # Chạy VietOCR trên CPU cho an toàn, tránh đụng VRAM với YOLO
vietocr_detector = Predictor(vietocr_config)
print("✅ VietOCR Loaded!")

# ---------------------------------------------------------------
# LOAD MODEL YOLO — thử best.pt trước, fallback về yolov8n.pt
# ---------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CUSTOM_MODEL = os.path.join(BASE_DIR, "..", "models", "best.pt")
DEFAULT_MODEL = os.path.join(BASE_DIR, "..", "yolov8n.pt")

if os.path.exists(CUSTOM_MODEL):
    model = YOLO(CUSTOM_MODEL)
    print(f"✅ Loaded custom model: {CUSTOM_MODEL}")
elif os.path.exists(DEFAULT_MODEL):
    model = YOLO(DEFAULT_MODEL)
    print(f"⚠️  Custom model not found. Using default: {DEFAULT_MODEL}")
else:
    model = YOLO("yolov8n.pt")   # auto-download
    print("⚠️  Downloading yolov8n.pt...")


def preprocess_image_for_ocr(image):
    """Tiền xử lý ảnh để Tesseract đọc chuẩn hơn"""
    image = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh


@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI Engine is running!"}


import re

@app.post("/predict")
async def predict_receipt(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return JSONResponse(
                content={"status": "error", "message": "Không thể đọc file ảnh"},
                status_code=400
            )

        results = model.predict(img, conf=0.25, verbose=False)
        detections = []
        
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                conf = box.conf[0].item()
                class_id = int(box.cls[0].item())
                class_name = model.names[class_id]

                cropped_img = img[y1:y2, x1:x2]
                if cropped_img.size == 0: continue

                if class_name == "Store_Name":
                    # Store Name là tiếng Việt -> Dùng VietOCR (Cần ảnh màu gốc)
                    pil_img = Image.fromarray(cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB))
                    extracted_text = vietocr_detector.predict(pil_img).strip()
                else:
                    # Date và Total Amount là số -> Dùng Tesseract (Cần ảnh binarize để tránh ảo giác)
                    processed_img = preprocess_image_for_ocr(cropped_img)
                    extracted_text = pytesseract.image_to_string(processed_img, lang='eng', config='--oem 3 --psm 6').strip()
                
                # BỘ LỌC LÀM SẠCH DỮ LIỆU (Regex Clean-up)
                clean_text = extracted_text
                if class_name == "Total_Amount":
                    # Khắc phục lỗi đọc sai số 0
                    text_lower = extracted_text.lower().replace('¢', '0').replace('o', '0')
                    # Lấy ra tất cả các cụm số
                    nums = re.findall(r'\d+[.,]\d+[.,]\d+|\d+[.,]\d+|\d+', text_lower)
                    if nums:
                        # Lấy cụm số cuối cùng (thường là số tiền, chữ nằm trước)
                        # Và xóa dấu chấm, phẩy để ra số nguyên
                        clean_text = nums[-1].replace(',', '').replace('.', '')
                    else:
                        clean_text = ""
                
                elif class_name == "Date":
                    # Ép tìm đúng định dạng Ngày/Tháng/Năm (có thể cách nhau bằng khoảng trắng)
                    date_match = re.search(r'(\d{2})[-/\s.](\d{2})[-/\s.](\d{4})', extracted_text)
                    if date_match:
                        day, month, year = int(date_match.group(1)), int(date_match.group(2)), int(date_match.group(3))
                        # Kiểm tra giá trị hợp lệ: ngày 01-31, tháng 01-12, năm hợp lý
                        if 1 <= day <= 31 and 1 <= month <= 12 and 2000 <= year <= 2099:
                            clean_text = f"{date_match.group(1)}/{date_match.group(2)}/{date_match.group(3)}"
                        else:
                            # Ngày/tháng vô lý (vd: 37/10, 00/13) -> bỏ qua
                            clean_text = ""
                    else:
                        clean_text = ""
                
                elif class_name == "Store_Name":
                    # Xóa các ký tự quá dị do OCR đọc sai
                    clean_text = re.sub(r'[^\w\s.,&!-]', '', extracted_text).strip()

                # Chỉ thêm vào danh sách nếu có chữ
                if clean_text:
                    detections.append({"label": class_name, "confidence": round(conf, 2), "box": [x1, y1, x2, y2], "text": clean_text})

        # LỌC TRÙNG NHÃN (Chỉ lấy kết quả có độ tự tin cao nhất cho mỗi label)
        unique_detections = {}
        for d in detections:
            label = d['label']
            if label not in unique_detections or d['confidence'] > unique_detections[label]['confidence']:
                unique_detections[label] = d
        detections = list(unique_detections.values())

        # Fallback: Trám các trường dữ liệu mà YOLO bỏ sót
        found_labels = [d['label'] for d in detections]
        missing_labels = [l for l in ['Store_Name', 'Date', 'Total_Amount'] if l not in found_labels]

        if missing_labels:
            print(f"Fallback: Đang quét lại ảnh để tìm {missing_labels}")
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            full_text = pytesseract.image_to_string(gray, lang='eng')
            lines = [line.strip() for line in full_text.split('\n') if line.strip()]
            
            if lines:
                if 'Store_Name' in missing_labels:
                    # Lấy dòng đầu tiên có chữ
                    store_name = re.sub(r'[^\w\s.,&!-]', '', lines[0]).strip()
                    if store_name:
                        detections.append({"label": "Store_Name", "confidence": 0.85, "box": [0,0,0,0], "text": store_name})
                
                if 'Date' in missing_labels:
                    date_match = re.search(r'(\d{2})[-/\s.](\d{2})[-/\s.](\d{4})', full_text)
                    if date_match:
                        day, month, year = int(date_match.group(1)), int(date_match.group(2)), int(date_match.group(3))
                        if 1 <= day <= 31 and 1 <= month <= 12 and 2000 <= year <= 2099:
                            clean_date = f"{date_match.group(1)}/{date_match.group(2)}/{date_match.group(3)}"
                            detections.append({"label": "Date", "confidence": 0.90, "box": [0,0,0,0], "text": clean_date})
                    
                if 'Total_Amount' in missing_labels:
                    total_text = ""
                    # Bỏ các chữ chung chung như 'tổng', 'cộng' để không bị nhầm với 'tổng số lượng'
                    keywords = ['tổng cộng', 'thành tiền', 'total', 'thanh toán', 'tong cong', 'thanh tien', 'thanh toan', 'teng cng', 'teng cong']
                    for line in reversed(lines):
                        if any(kw in line.lower() for kw in keywords):
                            nums = re.findall(r'\d+[.,]\d+[.,]\d+|\d+[.,]\d+|\d+', line)
                            if nums:
                                val = nums[-1].replace(',', '').replace('.', '')
                                # Tiền Việt Nam thường lớn hơn 100 đồng, tránh lấy nhầm số lượng (vd: 4)
                                if val.isdigit() and int(val) > 100:
                                    total_text = val
                                    break
                    if total_text:
                        detections.append({"label": "Total_Amount", "confidence": 0.80, "box": [0,0,0,0], "text": total_text})

        return JSONResponse(content={"status": "success", "data": detections})

    except Exception as e:
        return JSONResponse(
            content={"status": "error", "message": str(e)},
            status_code=500
        )