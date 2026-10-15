# Quản lý phòng trọ

Web app quản lý nhà trọ: **admin** quản lý phòng, người thuê, điện nước, hóa đơn, báo cáo; **người thuê** nhập chỉ số điện nước và xem tiền phải trả.

Stack: Next.js (App Router) · Supabase (Postgres + Auth) · Tailwind CSS.

## Thiết lập

### 1. Tạo project Supabase

1. Vào <https://supabase.com> → tạo project mới (chọn region gần, đặt mật khẩu DB).
2. Mở **SQL Editor** → dán toàn bộ nội dung `supabase/migrations/0001_init.sql` → **Run**.
3. Vào **Project Settings → API**, copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (bí mật, chỉ dùng ở server)

### 2. Biến môi trường

```bash
cp .env.local.example .env.local
```

Điền 3 giá trị vừa copy vào `.env.local`.

### 3. Tạo tài khoản admin đầu tiên

Trong Supabase: **Authentication → Users → Add user** (Create new user):

- Email + mật khẩu tùy chọn, bật **Auto Confirm User**.

Sau đó vào **SQL Editor** chạy (thay email của bạn):

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'admin@example.com');
```

> Trigger tự tạo bản ghi `profiles` khi có user mới (mặc định role `tenant`), nên chỉ cần nâng quyền lên `admin`.

### 4. Chạy

```bash
pnpm install
pnpm dev
```

Mở <http://localhost:3000> → đăng nhập bằng tài khoản admin.

## Luồng sử dụng

**Admin**
1. **Cài đặt** → nhập giá điện, giá nước, phí quản lý.
2. **Phòng** → thêm phòng (mã, giá thuê…).
3. **Người thuê** → thêm người thuê, gán phòng; nhập email + mật khẩu để tạo tài khoản đăng nhập cho họ (tùy chọn).
4. **Điện nước** → mỗi kỳ nhập chỉ số từng phòng (chỉ số cũ tự lấy từ kỳ trước).
5. **Hóa đơn** → tạo hóa đơn theo kỳ (tự tính từ chỉ số + giá), thêm phí khác nếu cần, đánh dấu đã thanh toán.
6. **Tổng quan** → doanh thu, công nợ, số phòng trống.

**Người thuê**
1. **Nhập điện nước** → nhập chỉ số mới → xem tiền tạm tính ngay.
2. **Hóa đơn** → xem lịch sử và số tiền quản lý đã chốt.

## Công thức tính tiền

```
Tổng = tiền phòng
     + (điện mới − cũ) × giá điện
     + (nước mới − cũ) × giá nước
     + phí quản lý
     + tổng phí khác (admin nhập tùy ý)
```
