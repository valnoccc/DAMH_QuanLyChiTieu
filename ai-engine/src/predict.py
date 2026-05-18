def find_matching_amount_box(boxes, class_names):
    """
    Hàm gióng hàng trục Y để tìm số tiền khớp với chữ Tổng tiền
    """
    label_box = None
    amount_boxes = []

    # 1. Phân loại các hộp (boxes) do YOLO trả về
    for box in boxes:
        cls_id = int(box.cls[0].item())
        cls_name = class_names[cls_id]
        
        coords = box.xyxy[0].cpu().numpy() # Lấy tọa độ [x_min, y_min, x_max, y_max]

        if cls_name == "label_total":
            label_box = coords
        elif cls_name == "amount_number":
            amount_boxes.append(coords)

    # Nếu AI không tìm thấy chữ "Tổng tiền" hoặc không có số nào, trả về None
    if label_box is None or len(amount_boxes) == 0:
        return None

    # 2. Tính tâm Y của chữ "Tổng tiền"
    label_y_center = (label_box[1] + label_box[3]) / 2

    best_match_box = None
    min_diff = float('inf')
    
    # Sai số cho phép trên trục dọc (pixel). 
    # Tăng lên nếu ảnh hay bị chụp nghiêng.
    Y_TOLERANCE = 25 

    # 3. Quét các số tiền để tìm cặp khớp nhất
    for amount_box in amount_boxes:
        # Điều kiện 1: Số tiền phải nằm bên PHẢI chữ "Tổng tiền"
        if amount_box[0] > label_box[2]: 
            amount_y_center = (amount_box[1] + amount_box[3]) / 2
            y_diff = abs(label_y_center - amount_y_center)

            # Điều kiện 2: Nằm trên cùng 1 hàng ngang (sai số thấp nhất)
            if y_diff <= Y_TOLERANCE and y_diff < min_diff:
                min_diff = y_diff
                best_match_box = amount_box

    return best_match_box