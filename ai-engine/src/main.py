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
model = YOLO("models/best_v3_2.pt") 

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

<<<<<<< HEAD
        # ==========================================
        # PHẦN 1: XỬ LÝ CÁC NHÃN BÌNH THƯỜNG (Store, Date...)
        # ==========================================
        for box in boxes:
            conf = box.conf[0].item()
            class_id = int(box.cls[0].item())
            class_name = class_names[class_id]
=======
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
>>>>>>> Up
            
            # Bỏ qua các nhãn liên quan đến Tổng tiền, chúng ta sẽ xử lý riêng
            if class_name in ["label_total", "amount_number", "Total_Amount"]:
                continue
                
<<<<<<< HEAD
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
=======
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
>>>>>>> Up

        return JSONResponse(content={"status": "success", "data": detections})

    except Exception as e:
        return JSONResponse(
            content={"status": "error", "message": str(e)},
            status_code=500
        )