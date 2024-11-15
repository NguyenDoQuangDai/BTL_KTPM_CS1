# CASE STUDY 1

## Hướng dẫn cài đặt
```sh
# Cài đặt các gói liên quan: Node.js và npm
$ npm install express sequelize pg pg-hstore body-parser cors dotenv

# Tạo folder cho database
mkdir url-shortener
cd url-shortener
npm init -y

# Cài đặt PostgreSQL:
-Cài đặt theo mặc định
-Mở pgAdmin 4 từ Start Menu.
Kết nối với server PostgreSQL:
Nhập mật khẩu "123456789" cho tài khoản postgres.
Nhấp "Save Password".
-Tạo cơ sở dữ liệu mới:
Trong pgAdmin, click chuột phải vào Databases > Create > Database.
Nhập tên cơ sở dữ liệu "short_url_db" và nhấp Save.

# Khởi chạy ứng dụng
$ node server.js
```
