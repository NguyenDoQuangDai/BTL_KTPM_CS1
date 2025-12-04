# CASE STUDY 1 KIẾN TRÚC MÁY TÍNH

## Hướng dẫn cài đặt

```sh
# Cài đặt PostgreSQL:
-Cài đặt theo mặc định
-Mở pgAdmin 4 từ Start Menu.
Kết nối với server PostgreSQL:
Nhập mật khẩu "123456789" cho tài khoản postgres.
Nhấp "Save Password".
-Tạo cơ sở dữ liệu mới:
Trong pgAdmin, click chuột phải vào Databases > Create > Database.
Nhập tên cơ sở dữ liệu "short_url_db" và nhấp Save.

# Cài đặt các gói liên quan: Node.js và npm
cd url-shortener
npm install express sequelize pg pg-hstore body-parser cors dotenv idb node-cache express-rate-limit

# Khởi chạy ứng dụng
$ node server.js
```

## Đề bài
Dưới đây là một chương trình đơn giản sử dụng `express.js`, có mục tiêu để rút gọn link. Chương trình có thể chưa hoàn toàn được tối ưu.

## Mô Tả
| Endpoint | Phương thức | Mục tiêu
|--|:--:|--|
| /short/:id | GET | Trả về đường dẫn gốc
| /create?url= | POST | Trả về ID được thu gọn


## Yêu cầu
 - Tối ưu chương trình trên (nếu cảm thấy cần thiết)
 - Triển khai thành web hoàn chỉnh (tuỳ chọn)
 - Thêm lớp persistent bằng cách sử dụng ORM (Object-Relational Mapping)
 - *Đánh giá* và *cải tiến* hiệu năng dựa trên một mẫu kiến trúc tuỳ chọn.
