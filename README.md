# DAMH_QuanLyChiTieu - Smart Finance AI

![Banner](https://img.shields.io/badge/Status-Developing-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**DAMH_QuanLyChiTieu** là hệ thống quản lý chi tiêu thông minh tích hợp trí tuệ nhân tạo (AI). Dự án sử dụng mô hình YOLOv8 để tự động nhận diện và bóc tách dữ liệu từ hóa đơn mua hàng, giúp người dùng theo dõi tài chính cá nhân một cách nhanh chóng và chính xác.

---

## Công Nghệ Sử Dụng

### Frontend
<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

### Backend & Database
<p align="left">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/WampServer-005E8E?style=for-the-badge&logo=wampserver&logoColor=white" />
</p>

### AI Engine (OCR & Detection)
<p align="left">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/YOLOv8-00FFFF?style=for-the-badge&logo=ultralytics&logoColor=black" />
  <img src="https://img.shields.io/badge/Google_Colab-F9AB00?style=for-the-badge&logo=googlecolab&logoColor=white" />
  <img src="https://img.shields.io/badge/Roboflow-FF1919?style=for-the-badge&logo=roboflow&logoColor=white" />
</p>

---

## Tổng Quan Đề Tài

Dự án giải quyết vấn đề quản lý chi tiêu thủ công gây tốn thời gian. Người dùng chỉ cần chụp ảnh hóa đơn, hệ thống sẽ tự động thực hiện:

1.  **Phát hiện (Detection):** Sử dụng YOLOv8 để xác định vị trí các vùng thông tin quan trọng như Tên cửa hàng, Ngày tháng, và Tổng tiền.
2.  **Nhận diện (OCR):** Bóc tách văn bản từ các vùng ảnh đã phát hiện.
3.  **Lưu trữ:** Tự động phân loại và lưu thông tin vào cơ sở dữ liệu MySQL thông qua Backend NestJS.
4.  **Thống kê:** Cung cấp biểu đồ trực quan về xu hướng chi tiêu trên giao diện React.

---

## Cấu Trúc Thư Mục

```text
smart-finance-ai/
├── frontend-react/   # Giao diện người dùng (React Vite + Tailwind v4)
├── backend-nestjs/  # API xử lý logic & Database (TypeORM + MySQL)
├── ai-engine/       # Dịch vụ AI (FastAPI + YOLOv8)
└── datasets/        # Tập dữ liệu huấn luyện (YOLO format)
