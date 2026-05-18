import os

# =====================================================================
# CHÚ Ý: Sửa đường dẫn này trỏ đúng đến thư mục dataset bạn vừa giải nén
# =====================================================================
dataset_path = r"D:\VSC\dataset"

sub_folders = ["train", "valid", "test"]
total_deleted = 0

print("🧹 Bắt đầu tiến trình quét và dọn dẹp ảnh trùng lặp...")
print("-" * 60)

for folder in sub_folders:
    images_dir = os.path.join(dataset_path, folder, "images")
    labels_dir = os.path.join(dataset_path, folder, "labels")
    
    seen_base_names = set()
    deleted_count = 0
    
    if os.path.exists(images_dir):
        # Sắp xếp danh sách để đảm bảo tính nhất quán khi lọc
        filenames = sorted(os.listdir(images_dir))
        
        for filename in filenames:
            if ".rf." in filename:
                # Tách lấy phần tên gốc trước chữ .rf.
                base_name = filename.split(".rf.")[0]
                
                # Nếu tên gốc này đã xuất hiện rồi -> Tiến hành xóa bản sao thừa
                if base_name in seen_base_names:
                    # 1. Xóa file ảnh
                    img_path = os.path.join(images_dir, filename)
                    if os.path.exists(img_path):
                        os.remove(img_path)
                    
                    # 2. Xóa file nhãn .txt tương ứng
                    label_filename = filename.rsplit(".", 1)[0] + ".txt"
                    label_path = os.path.join(labels_dir, label_filename)
                    if os.path.exists(label_path):
                        os.remove(label_path)
                        
                    deleted_count += 1
                else:
                    # Nếu là lần đầu tiên gặp tên gốc này -> Giữ lại làm bản gốc
                    seen_base_names.add(base_name)
                    
        print(f" Thư mục [{folder.upper()}]: Đã xóa {deleted_count} cặp ảnh và nhãn trùng.")
        total_deleted += deleted_count
    else:
        print(f" Thư mục [{folder.upper()}]: Không tìm thấy đường dẫn cấu trúc images/labels.")

print("-" * 60)
print(f"🎉 Hoàn thành! Tổng cộng đã dọn sạch {total_deleted} file lỗi trùng lặp.")