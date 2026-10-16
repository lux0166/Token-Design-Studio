# Fluento Academy

Web học tiếng Anh 1 kèm 1, ưu tiên quản trị trung tâm và giáo viên theo yêu cầu của bạn. Đây là bản giao diện có tương tác, dùng dữ liệu mẫu và lưu trên trình duyệt để kiểm chứng trải nghiệm trước khi xây hệ thống vận hành.

## Chạy ứng dụng

Tại thư mục `DemoUI`:

```powershell
npm --prefix apps/english-one install
npm run english:dev
```

Mở **http://127.0.0.1:5174/**. Có thể nhấp `Start Fluento.cmd` tại thư mục gốc. Token Studio tiếp tục dùng cổng 5173 và máy chủ MCP cổng 4318; Fluento có package riêng và không cần máy chủ Token Studio để hiển thị theme đã xuất.

```powershell
npm run english:test
npm run english:build
```

Bản build nằm trong `apps/english-one/dist`. Để xem bản build: chạy `npm --prefix apps/english-one run preview`, rồi mở http://127.0.0.1:4174/.

## Những gì đã có

- Tổng quan với số liệu tính từ danh sách đang dùng, lịch nhỏ, lớp theo ngày, học viên cần hỗ trợ và nhắc việc nội bộ.
- Danh sách học viên: tìm kiếm, lọc trạng thái/giáo viên, phân trang, xuất CSV, thêm hồ sơ và chặn email trùng.
- Hồ sơ cá nhân: mục tiêu, trình độ, giáo viên, bốn kỹ năng, lộ trình tham khảo bốn chặng, số buổi và lịch sử nhận xét/bài tập.
- Đặt lịch 25/50/80 phút: kiểm tra ngày giờ, trùng giáo viên, trùng học viên và buổi vượt ngày. Có bước xác nhận hủy lịch.
- Nhận xét sau buổi: điểm 1–10, nhận xét, bài tập và tùy chọn cập nhật bốn kỹ năng 0–100. Hoàn thành buổi học cập nhật số buổi; một buổi chỉ có một nhận xét và không được cộng hai lần.
- Đội ngũ giáo viên: hồ sơ, thêm giáo viên, xem lịch được lọc sẵn theo người dạy.
- Góc nhìn giáo viên Sarah: lọc học viên, lớp và lộ trình phụ trách. Chuyển qua menu tài khoản ở chân thanh bên; điện thoại mở menu điều hướng trước.
- Theo dõi học phí cục bộ, học liệu mẫu có nội dung và tải tệp, cài đặt tên trung tâm/nhắc việc.
- Giao diện máy tính và điện thoại, menu dạng drawer, bảng cuộn bên trong, hộp thoại có quản lý focus và hỗ trợ Escape.

## Dữ liệu và giới hạn

Dữ liệu dùng `localStorage`, khóa `fluento.academy.v1`, riêng theo trình duyệt và origin. Sau lần mở đầu, chỉnh sửa được giữ khi tải lại trang. Xóa dữ liệu trình duyệt sẽ mất chỉnh sửa. Lưu cục bộ không thay thế cơ sở dữ liệu, sao lưu hay đồng bộ nhiều người dùng. Nếu trình duyệt từ chối ghi, ứng dụng hiển thị lỗi lưu.

Mẫu ban đầu có 6 học viên, 4 giáo viên và lịch theo ngày hiện tại. Các kiểm tra tương tác có thể đã thêm hồ sơ mẫu và nhận xét trong trình duyệt đang mở. Trạng thái lớp là dữ liệu mẫu; không kết nối hoạt động video thực tế. Tiến độ là tỷ lệ số buổi đã hoàn thành trong gói, không phải mức tăng năng lực. Điểm kỹ năng do giáo viên nhập, không quy đổi tự động ra CEFR. Lộ trình bốn chặng là khung tham khảo, chưa có trình biên tập chương trình cá nhân.

Chuyển góc nhìn là thao tác xem thử, chưa phải tài khoản hay phân quyền bảo mật. Zoom/Google Meet, cơ sở dữ liệu/máy chủ, đăng nhập, email/SMS tự động, thanh toán/hóa đơn và AI chưa kết nối. “Ghi nhận đã thu” chỉ đưa số dư mẫu về 0 trong trình duyệt, chưa có lịch sử giao dịch hay chứng từ. AI đánh giá và gợi ý bài tập thuộc giai đoạn sau theo bản yêu cầu.

## Thiết kế và nguồn component

Thực hiện theo skill `token-studio-shadcn`: brief → reuse → spec → build → verify → handoff. Theme **Fluento · Learning** đã được tạo và xuất qua MCP Token Studio, ID `59a2c492-daeb-4b2f-8d38-57a0e09e3723`. `src/theme.css` là bản xuất Tailwind v4; `docs/token-studio.json` lưu kết quả bảy cặp tương phản AA ở chế độ sáng. Nếu cần đồng bộ lại, chạy `npx tsx scripts/sync-theme.ts` khi MCP 4318 đang chạy; script dùng revision và tôn trọng token lock.

Component shadcn/ui chính thức, primitive Radix, đã cài bằng CLI và lưu source trong `src/components/ui` (MIT). Bố cục nghiệp vụ được ghép từ Button, Card, Dialog, Sheet, Tabs, Select, Field, Table, Avatar, Progress và các primitive đi kèm. React/Recharts (MIT), Lucide (ISC), font Inter (OFL). Hình minh họa được tạo riêng cho Fluento; font phục vụ từ package cục bộ.

Tài liệu: [Design contract](docs/DESIGN.md), [kết quả kiểm tra](docs/VERIFICATION.md), [desktop](docs/dashboard-desktop.png), [mobile](docs/dashboard-mobile.png), [hồ sơ học viên](docs/student-profile.png).
