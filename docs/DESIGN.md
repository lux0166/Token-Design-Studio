# Token Studio — design contract

Reference: concept.png (1536 × 1024). Original independent local editor, inspired by the workflow described in the supplied DS Manager article.

White surfaces, cool gray #f5f7f9 canvas, ink #0f172a, muted #64748b, border #e2e8f0, green #18794e. System sans-serif with full Vietnamese coverage. Chrome 13px, body 14px, panel headings 18px, page title 30px, preview headline 30px. Icons: Lucide, 18px, stroke 1.7. Buttons: 36px height, 6px radius. Green primary and outlined secondary, clear focus rings.

Desktop at 1536px: 264px sidebar, 64px toolbar, 332px inspector, 34px footer. Main canvas flexible, 24px gutters. Center title, tabs, broad hero specimen, two functional sample cards, palette strip. Inspector color fields, palette presets, light/dark toggle, radius, contrast. Chrome scales down at narrower desktop widths. Mobile: sidebar drawer, inspector below canvas, toolbar keeps import/export within reach. Preview device toggle constrains specimen to 390px without changing app layout.

Reference copy: Token Studio; Không gian cá nhân; Tổng quan; Design system; Kết nối MCP; Lịch sử; DESIGN SYSTEMS; Studio mặc định; Ocean; Violet; Lưu trên máy của bạn; Nhập theme; Xuất CSS; Một hệ thống nhất quán. Mọi thành phần đồng bộ.; Thành phần; Typography; Không gian cho ý tưởng lớn.; Xây dựng sản phẩm tiếp theo với hệ thống của riêng bạn.; Bắt đầu; Khám phá; Tạo tài khoản; Thông báo; Bảng màu; Tùy chỉnh; Các thay đổi được lưu tự động; Màu sắc; Kiểu chữ; Hình dạng; Đặt lại; Sáng; Tối; Bo góc; Độ tương phản; Đã lưu tất cả thay đổi; Local-first; v0.1.0.

Reusable families: toolbar buttons, icon buttons, segmented controls, sidebar links, inspector fields, token rows, preview specimens, dialogs. Structure: App composition, useStudio data synchronization, Sidebar, Inspector, Preview, WorkspacePages, Dialogs. Real disk-backed API, validated schemas, optimistic revision checks, atomic writes. HTTP MCP operates on the same store. No API key or paid AI provider required.

Intentional extensions beyond the one-screen reference: MCP setup and actual call log, system creation/rename, import review, export, history and overview pages are required by the selected Editor + MCP scope. Additional component and typography tab contents use the same primitives. Small geometry and mark are native vector/CSS so specimens respond to token changes. Color hex swatches are normalized; contrast is computed, never a fixed success badge. Locks appear unlocked until set by user. The static concept's unconditional saved badges become truthful UI states.
