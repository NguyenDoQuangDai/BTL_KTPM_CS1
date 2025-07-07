# URL Shorten

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
