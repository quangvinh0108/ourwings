# 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

## ✅ Các bước cần làm:

### 1️⃣ Cài đặt dependencies
Bạn đã làm xong bước này!

### 2️⃣ Setup Database PostgreSQL

**Option A: Sử dụng PostgreSQL Local**
- Mở **pgAdmin 4**
- Kết nối với server PostgreSQL (localhost:5432)
- Tạo database mới tên: `OurwingsDB` (hoặc tên bạn muốn)
- Database đã được setup trong file `.env`

**Option B: Sử dụng Neon.tech (Cloud - Khuyên dùng)**
1. Truy cập: https://neon.tech
2. Sign up miễn phí
3. Tạo project mới
4. Copy connection string
5. Paste vào file `.env` → `DATABASE_URL="..."`

### 3️⃣ Push Database Schema

```bash
npm run db:push
```

### 4️⃣ Setup Google OAuth (Bắt buộc để đăng nhập)

#### Bước 1: Tạo Google Cloud Project
1. Truy cập: https://console.cloud.google.com/
2. Click **"Select a project"** → **"New Project"**
3. Project name: `Quizlet Clone`
4. Click **"Create"**

#### Bước 2: Configure OAuth Consent Screen
1. Sidebar → **"APIs & Services"** → **"OAuth consent screen"**
2. Chọn **"External"** → Click **"Create"**
3. Điền thông tin:
   - App name: `Quizlet Clone`
   - User support email: [email của bạn]
   - Developer contact: [email của bạn]
4. Click **"Save and Continue"**
5. Bỏ qua **Scopes** → Click **"Save and Continue"**
6. Bỏ qua **Test users** → Click **"Save and Continue"**

#### Bước 3: Tạo OAuth Credentials
1. Sidebar → **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `Quizlet Clone Web Client`
5. **Authorized redirect URIs** → Click **"Add URI"**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Click **"Create"**
7. Copy **Client ID** và **Client Secret**

#### Bước 4: Cập nhật file `.env`
```env
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

### 5️⃣ Setup GitHub OAuth (Optional - Tùy chọn)

1. GitHub Settings → Developer settings → OAuth Apps
2. New OAuth App
3. Application name: `Quizlet Clone`
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
6. Copy Client ID và Client Secret vào `.env`:
   ```env
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"
   ```

### 6️⃣ Chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt: http://localhost:3000

---

## 📋 Checklist

- [x] Cài đặt dependencies (`npm install`) ✅
- [ ] Tạo database PostgreSQL
- [ ] Push database schema (`npm run db:push`)
- [ ] Lấy Google OAuth credentials
- [ ] Cập nhật file `.env` với OAuth credentials
- [ ] Chạy ứng dụng (`npm run dev`)
- [ ] Test đăng nhập với Google

---

## 🔧 Nội dung file `.env` (Mẫu)

```env
# Database
DATABASE_URL="postgresql://postgres:1@localhost:5432/OurwingsDB"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-change-this-to-random-string-minimum-32-characters-long"

# Google OAuth (BẮT BUỘC)
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123def456"

# GitHub OAuth (TÙY CHỌN)
GITHUB_ID="Iv1.abc123def456"
GITHUB_SECRET="abc123def456ghi789"
```

---

## ❗ Lưu ý quan trọng

1. **NEXTAUTH_SECRET**: Phải là chuỗi ngẫu nhiên ít nhất 32 ký tự
2. **Google OAuth**: BẮT BUỘC để đăng nhập vào ứng dụng
3. **Redirect URI**: Phải chính xác `http://localhost:3000/api/auth/callback/google`
4. **Database**: Phải tạo database trước khi chạy `npm run db:push`

---

## 🆘 Troubleshooting

### Lỗi "database does not exist"
→ Chưa tạo database trong PostgreSQL
→ Giải pháp: Tạo database bằng pgAdmin

### Lỗi "Cannot find module 'autoprefixer'"
→ Chạy: `npm install autoprefixer`

### Lỗi đăng nhập Google
→ Kiểm tra lại GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
→ Kiểm tra Redirect URI có đúng không

### App không chạy
→ Dừng server (Ctrl+C) và chạy lại `npm run dev`

---

## 📧 Liên hệ

Nếu gặp vấn đề, hãy kiểm tra:
1. File `.env` có đầy đủ thông tin
2. Database đã được tạo
3. Google OAuth đã setup đúng
4. Port 3000 không bị chiếm bởi app khác
