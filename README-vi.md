# ✨ Pulsar - Trình Tải Xuống Media Tối Ưu Của Bạn ✨

[English](README.md) | Tiếng Việt

Pulsar là một ứng dụng tải xuống media đẹp mắt, mạnh mẽ và thân thiện với người dùng, được thiết kế để giúp bạn dễ dàng tải xuống video và âm thanh từ các trang web yêu thích! Được xây dựng với giao diện người dùng frontend hiện đại bằng React và backend mạnh mẽ bằng Node.js, Express, TypeScript và Prisma, Pulsar tận dụng công cụ `yt-dlp` đáng kinh ngạc để mang đến cho bạn trải nghiệm tải xuống liền mạch.

## 🚀 Các Tính Năng Nổi Bật

-   **🌐 Tương thích rộng rãi:** Tải xuống từ vô số trang web được `yt-dlp` hỗ trợ.
-   **🖥️ Giao diện người dùng trực quan:** Giao diện sạch sẽ, phản hồi nhanh để điều hướng dễ dàng.
-   **📥 Quản lý hàng đợi thông minh:** Theo dõi các lượt tải xuống của bạn với một hàng đợi có tổ chức.
-   **🕰️ Lịch sử toàn diện:** Dễ dàng xem lại các lượt tải xuống trước đây của bạn, dù đã hoàn thành, gặp lỗi hay đã hủy.
-   **⚙️ Mẫu đối số tùy chỉnh:** Lưu và sử dụng lại các đối số dòng lệnh `yt-dlp` yêu thích của bạn để tải xuống theo yêu cầu.
-   **🍪 Hỗ trợ Cookie:** Tải xuống liền mạch nội dung từ các trang web yêu cầu đăng nhập bằng cách nhập tệp cookie định dạng Netscape.
-   **⚡ Cập nhật thời gian thực:** Xem tiến độ tải xuống của bạn diễn ra trực tiếp với các cập nhật được hỗ trợ bởi WebSocket.
-   **🔍 Kiểm tra phiên bản:** Luôn cập nhật thông tin với tính năng xác minh phiên bản `yt-dlp` và `ffmpeg` tích hợp.

## 🏗️ Cấu Trúc Dự Án

Pulsar được tổ chức gọn gàng thành hai thành phần cốt lõi: `frontend` và `backend`.

```
pulsar/
├── backend/                # Bộ não của hoạt động: Node.js, Express, TypeScript, Prisma
│   ├── src/                # Mã nguồn TypeScript của backend
│   ├── prisma/             # Schema cơ sở dữ liệu và migrations
│   ├── .env.example        # Tệp mẫu biến môi trường backend
│   ├── package.json        # Các phụ thuộc và script của backend
│   └── README.md           # Tài liệu chuyên sâu cho backend
├── frontend/               # Giao diện đẹp mắt: React, TypeScript, Vite
│   ├── public/             # Tài sản tĩnh (hình ảnh, v.v.)
│   ├── src/                # Mã nguồn React/TypeScript của frontend
│   ├── package.json        # Các phụ thuộc và script của frontend
│   └── README.md           # Tài liệu chi tiết cho frontend
├── .gitignore              # Các tệp và thư mục bị Git bỏ qua
├── README.md               # Bạn đang ở đây! Tổng quan dự án.
└── README-vi.md            # Phiên bản tiếng Việt của README này.
```

## 🛠️ Yêu Cầu Hệ Thống

Trước khi bạn bắt đầu cuộc phiêu lưu tải xuống của mình, hãy đảm bảo hệ thống của bạn có các yếu tố cần thiết sau:

-   **Node.js** (phiên bản 18 trở lên được khuyến nghị)
-   **npm** (Trình quản lý gói Node)
-   **yt-dlp**: Trình tải xuống video dòng lệnh mạnh mẽ.
    -   Hướng dẫn cài đặt: [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp#installation)
-   **ffmpeg**: Cần thiết cho xử lý hậu kỳ (như chuyển đổi định dạng).
    -   Hướng dẫn cài đặt: [ffmpeg Official Site](https://ffmpeg.org/download.html)

## 🚀 Bắt Đầu: Thiết Lập & Cài Đặt

Hãy cùng đưa Pulsar hoạt động trên máy cục bộ của bạn!

1.  **Clone repository:**
    ```bash
    git clone https://github.com/your-username/pulsar.git
    cd pulsar
    ```

2.  **Thiết lập Backend:**
    Điều hướng đến thư mục `backend`, cài đặt các phụ thuộc và thiết lập cơ sở dữ liệu.
    ```bash
    cd backend
    npm install
    npx prisma migrate dev --name init # Khởi tạo Prisma và tạo cơ sở dữ liệu SQLite của bạn
    cp .env.example .env # Tạo tệp .env của bạn từ ví dụ
    # ⚠️ Quan trọng: Chỉnh sửa tệp .env của bạn để cấu hình PORT, DOWNLOAD_DIRECTORY, FRONTEND_URL, v.v.
    cd ..
    ```

3.  **Thiết lập Frontend:**
    Di chuyển đến thư mục `frontend` và cài đặt các phụ thuộc của nó.
    ```bash
    cd frontend
    npm install
    cd ..
    ```

## 🏃‍♀️ Chạy Ứng Dụng

Pulsar có thể chạy ở hai chế độ: phát triển (hai dịch vụ riêng biệt) hoặc production (một cổng duy nhất).

### Chế độ Phát triển (Hai Terminal)

1.  **Khởi động Máy chủ Backend:**
    Mở terminal đầu tiên của bạn, điều hướng đến thư mục `backend` và khởi chạy máy chủ:
    ```bash
    cd backend
    npm run dev
    ```
    Máy chủ backend sẽ hoạt động tại `http://localhost:4000` (hoặc cổng bạn đã cấu hình trong tệp `.env`).

2.  **Khởi động Ứng dụng Frontend:**
    Mở một terminal mới khác, đi đến thư mục `frontend` và khởi động giao diện người dùng:
    ```bash
    cd frontend
    npm run dev
    ```
    Giao diện người dùng Pulsar của bạn sẽ hoạt động tại `http://localhost:5173` (hoặc cổng được cấu hình bởi Vite của bạn).

Khi cả hai đang chạy, hãy mở trình duyệt của bạn và truy cập địa chỉ frontend.

### Chế độ Production (Một Cổng Duy Nhất)

Đối với triển khai production, các tài sản frontend được build và phục vụ bởi backend trên một cổng duy nhất.

1.  **Build Tài sản Frontend:**
    Mở terminal của bạn, điều hướng đến thư mục `frontend` và build frontend cho production:
    ```bash
    cd frontend
    npm run build
    ```
    Thao tác này sẽ biên dịch frontend và đặt các tài sản tĩnh vào thư mục `backend/public`.

2.  **Build Backend (Biên dịch TypeScript):**
    Điều hướng đến thư mục `backend` và biên dịch mã TypeScript:
    ```bash
    cd backend
    npm run build
    ```

3.  **Khởi động Máy chủ Backend:**
    Từ thư mục `backend`, khởi động máy chủ:
    ```bash
    npm start
    ```
    Backend sẽ phục vụ cả frontend và API trên một cổng duy nhất (mặc định 4000, hoặc `PORT` bạn đã cấu hình). Truy cập ứng dụng qua địa chỉ của backend (ví dụ: `http://localhost:4000`).

## 💡 Cách Sử Dụng Pulsar

-   **Tab Downloader:** Dán URL video hoặc playlist của bạn, nhấn "Fetch Info," chọn định dạng mong muốn và nhấp vào "Add to Queue." Đơn giản vậy thôi!
-   **Tab History:** Duyệt qua các lượt tải xuống trước đây của bạn. Dễ dàng xóa các mục đã hoàn thành, gặp lỗi hoặc đã hủy.
-   **Tab Settings:** Tinh chỉnh trải nghiệm của bạn! Quản lý các mẫu đối số `yt-dlp` tùy chỉnh và nhập/xóa tệp cookie một cách an toàn cho nội dung riêng tư.
-   **Phép thuật thời gian thực:** Xem tiến độ tải xuống của bạn cập nhật ngay lập tức, nhờ giao tiếp WebSocket.

## 🎨 Tùy Chỉnh

Điều chỉnh Pulsar theo nhu cầu của bạn!

### Biến Môi Trường

Điều chỉnh các biến môi trường trong tệp `.env` của thư mục `backend` để thay đổi cổng máy chủ, thư mục tải xuống mặc định, v.v.

Đối với **triển khai production** chạy trên một cổng duy nhất (backend phục vụ frontend), các cấu hình `FRONTEND_URL` và `VITE_BACKEND_URL` thường không cần thiết vì frontend và backend giao tiếp trên cùng một origin.

Ví dụ `backend/.env` (đối với phát triển cục bộ):
```
# Cấu hình máy chủ
PORT=4000

# Cấu hình tải xuống
DOWNLOAD_DIRECTORY=./downloads

# URL cơ sở dữ liệu cho Prisma (ví dụ SQLite)
DATABASE_URL="file:./dev.db"

# URL Frontend cho CORS trong production (chỉ cần nếu frontend ở một origin khác)
# FRONTEND_URL=http://localhost:5173

# Cookie Cấu hình
COOKIE_FILE_PATH=./cookies.txt

# Cấu hình giữ lại tệp (tính bằng giờ)
FILE_RETENTION_HOURS=5

# URL Backend (để sử dụng nội bộ hoặc nếu backend cần biết URL công khai của chính nó)
# Đây phải là URL backend công khai của bạn trong production, ví dụ: https://api.yourdomain.com
# BACKEND_URL=http://localhost:4000
```

## 👋 Đóng Góp

Chúng tôi hoan nghênh các đóng góp! Nếu bạn có ý tưởng, sửa lỗi hoặc tính năng mới, vui lòng fork repository và gửi pull request.

## 📄 Giấy Phép

Dự án này được cấp phép theo Giấy phép MIT. Xem tệp [LICENSE](LICENSE) để biết thêm chi tiết.