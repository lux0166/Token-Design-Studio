# Token Studio

Trình quản lý design system chạy local, có editor tiếng Việt và MCP server thật. Bạn sở hữu mã nguồn và dữ liệu, không cần tài khoản hoặc thuê bao Token Studio.

## Chạy ứng dụng

Yêu cầu Node.js 22.12+ (đã kiểm tra bằng Node 24), npm và một trình duyệt hiện đại.

```powershell
npm install
npm run dev
```

Mở **http://127.0.0.1:5173**. Server dữ liệu và MCP chạy tại **http://127.0.0.1:4318**. Giữ terminal đang chạy trong lúc sử dụng editor hoặc MCP.

Chạy bản build, không cần Vite:

```powershell
npm run build
npm start
```

Sau đó mở **http://127.0.0.1:4318**. Có thể dùng `Start Token Studio.cmd` trên Windows để tự cài dependency còn thiếu, build và mở ứng dụng. Đóng terminal để dừng.

## Có gì trong bản đầu

- Tạo và đổi tên nhiều design system; thư viện 48 theme có sẵn và các hệ thống cá nhân để tái sử dụng.
- 32 token màu cho mỗi chế độ sáng/tối, tương thích tên token của shadcn/ui, gồm chart và sidebar.
- Font Inter được đóng gói cục bộ, lựa chọn font hệ thống, cỡ chữ, bo góc, đơn vị khoảng cách.
- Preview component tương tác: form, button, input, switch, checkbox, radio, select, badge, alert, progress và typography; chế độ desktop/mobile.
- Khóa token: editor và MCP đều từ chối sửa giá trị đã khóa. Chỉ editor có thao tác khóa/mở khóa.
- Tự lưu xuống đĩa; thay đổi MCP hiển thị trên editor sau khoảng 1.5 giây. Báo mất kết nối và xung đột phiên bản.
- Lịch sử tối đa 60 thay đổi mỗi hệ thống; undo/redo, Ctrl+Z / Ctrl+Shift+Z ngoài trường nhập liệu.
- Đọc CSS HEX, RGB, HSL (cả bare channels của shadcn cũ) và OKLCH. Xem thay đổi trước khi nhập. Không chạy CSS, JavaScript hoặc `@import` từ file.
- Xuất CSS Tailwind v4 / shadcn/ui và snapshot JSON; nhập JSON thành hệ thống mới.
- Tính WCAG contrast cho 7 cặp chữ/nền theo AA 4.5:1 và AAA 7:1; liệt kê cặp không đạt trước.
- HTTP MCP, adapter stdio, resource workspace và nhật ký 100 lời gọi gần nhất.
- Quy trình Design & Ship bảy bước, skill Codex, tool `get_workflow`, hai prompt `grill_me` / `design_and_ship` và bốn resource hướng dẫn.

## Quy trình làm việc cho agent

Agent làm việc theo bảy bước: **Đọc bối cảnh → Grill me / phỏng vấn → Kiểm kê & tái sử dụng → Hoàn thiện đặc tả → Triển khai → Kiểm chứng → Bàn giao**. Mỗi bước có đầu ra và điều kiện hoàn thành. Quy trình ưu tiên component đã cài, block phù hợp từ registry chính thức/của dự án, rồi mới xây phần còn thiếu. Các API, item ID và giấy phép phải được kiểm tra khi dùng; không cần mua ProBlocks.

Bốn chế độ: `grill-me` (phỏng vấn và tạo đặc tả), `design-and-build` (xây mới), `replicate` (dựng theo tham chiếu), `refine` (sửa giao diện hiện tại). Các chế độ triển khai cũng phỏng vấn khi còn quyết định quan trọng chưa rõ. Kiểm chứng riêng độ khớp thiết kế và hành vi; không tuyên bố pixel-perfect, production-ready, tăng tốc 10x hoặc tăng conversion khi chưa có bằng chứng.

Trang **Kết nối MCP → Quy trình Design & Ship** hiển thị bảy bước, mặc định chế độ **Grill me · Phỏng vấn → Đặc tả**, cho viết ý tưởng, sao chép yêu cầu phỏng vấn và tải hướng dẫn kèm mẫu SPEC.md. Agent thực hiện cuộc phỏng vấn trong client AI; editor không tự mở một phiên chat AI.

Phỏng vấn mặc định một câu mỗi vòng, tối đa ba câu liên quan. Agent đọc các câu trả lời đã có, hỏi sâu vào ví dụ và ngoại lệ, giải quyết mâu thuẫn và ghi sổ quyết định: đã xác nhận / bằng chứng dự án / được giao quyết định / còn mở / mâu thuẫn. Không coi im lặng là chọn mặc định; câu hỏi quan trọng cần trả lời trước phần triển khai phụ thuộc. Khi người dùng đã giao quyền quyết định trong một phạm vi, agent ghi rõ nguồn giao quyền và tiếp tục trong phạm vi đó.

Đầu ra là **SPEC.md** gồm người dùng, kết quả mong muốn, phạm vi và phần loại trừ, hành trình, quy tắc nghiệp vụ, dữ liệu/tích hợp, ràng buộc UX, tiêu chí nghiệm thu Given/When/Then, nguồn quyết định và câu hỏi còn mở. `grill-me` dừng ở đặc tả; các chế độ xây dựng tiếp tục khi đã đủ thông tin và đã có yêu cầu triển khai.

Cài skill cho Codex trên máy đang dùng:

```powershell
npm run skill:install
```

Script cài vào `$CODEX_HOME/skills/token-studio-shadcn`, hoặc `~/.codex/skills/token-studio-shadcn` nếu biến môi trường không được đặt. Nó không ghi đè bản skill đã chỉnh sửa và không tự đổi cấu hình MCP. Mở phiên Codex mới rồi dùng:

```text
$token-studio-shadcn Thiết kế và triển khai trang đăng ký cho sản phẩm của tôi.
Dùng Token Studio, đọc dự án hiện có, tái sử dụng component/block phù hợp,
phỏng vấn các điểm quan trọng chưa rõ, tạo SPEC.md,
chốt thiết kế có thông số, triển khai và kiểm chứng bằng trình duyệt.
```

Để chỉ phỏng vấn: `$token-studio-shadcn Grill me về ý tưởng [mô tả]. Hỏi để làm rõ rồi tạo SPEC.md, chưa viết code.` Với client MCP khác, gọi `get_workflow` với `mode: "grill-me"` hoặc chọn prompt `grill_me` với `task`. Triển khai đầy đủ dùng `design_and_ship` với `task` và `mode`. Initialize response cũng hướng dẫn agent đọc quy trình. Resource gồm `token-studio://workflow`, `token-studio://workflow/interview`, `token-studio://workflow/reuse`, `token-studio://workflow/handoff`. Adapter stdio chuyển tiếp cả prompts và resources giống HTTP.

Đây là hướng dẫn cho agent, không phải cơ chế cưỡng chế thực thi. Client có thể không hiển thị prompts/resources; tool `get_workflow` vẫn đọc được toàn bộ quy trình. Nếu không có MCP Token Studio, skill có thể dùng token của dự án và phải nói rõ chưa đồng bộ với editor. Việc deploy/publish vẫn tuân theo phạm vi người dùng đã cho phép.

Nguồn chuẩn để sửa quy trình nằm trong `skills/token-studio-shadcn/`. MCP đọc trực tiếp các file này khi server khởi động; nếu sửa file, khởi động lại server và cài lại skill sau khi đối chiếu bản đang dùng. Không có bản hướng dẫn riêng bị sao chép vào từng handler.

## Kết nối Codex

Khởi động Token Studio trước, sau đó:

```powershell
codex mcp add token-studio --url http://127.0.0.1:4318/mcp
```

Mở một phiên Codex mới để tải server. Với Codex desktop, có thể thêm HTTP MCP server trong Settings theo URL trên. Đây là server local không cần OAuth hoặc API key. Ứng dụng không tự sửa cấu hình Codex của bạn.

Yêu cầu thử:

> Dùng Token Studio: liệt kê các design system, đọc Studio mặc định, đổi primary ở chế độ sáng thành #2563EB, giữ nguyên các token đã khóa, rồi kiểm tra độ tương phản và xuất CSS.

## Claude Code, Cursor và stdio

```powershell
claude mcp add --transport http token-studio http://127.0.0.1:4318/mcp
```

Cursor, thêm vào `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "token-studio": {
      "url": "http://127.0.0.1:4318/mcp"
    }
  }
}
```

Trang **Kết nối MCP** trong editor có cấu hình stdio với đường dẫn tuyệt đối đúng cho máy hiện tại, dành cho Claude Desktop hoặc client chỉ hỗ trợ stdio. Adapter gọi server HTTP đang chạy; không mở kho dữ liệu riêng, tránh hai process cùng ghi một file. Có thể chạy adapter bằng `npm run mcp` hoặc `node --import tsx server/stdio.ts`; stdout chỉ chứa giao thức MCP.

Các tools:

| Tool | Công dụng |
| --- | --- |
| `get_workflow` | Quy trình UX → reuse → spec → code → verify → handoff và tài liệu hướng dẫn |
| `list_systems` | Danh sách hệ thống và workspace revision |
| `get_system` | Token, cài đặt, khóa, lịch sử và revision mới nhất |
| `list_themes` | Tìm trong 48 theme có sẵn, trả ID và mẫu màu |
| `get_theme` | Đọc snapshot và ghi chú tương thích của theme |
| `apply_theme` | Xem trước hoặc áp dụng theme, giữ các thuộc tính khóa |
| `create_system` | Tạo design system từ `themeId` hoặc preset cũ |
| `update_tokens` | Cập nhật một batch; yêu cầu `expectedRevision` |
| `export_css` | Trả CSS, không tự sửa file dự án |
| `check_contrast` | Tính tương phản chữ/nền |
| `import_css` | Parse và xem trước; `apply: true` để lưu với `expectedRevision` |

Đọc `get_system` ngay trước khi ghi. Revision cũ bị từ chối. `update_tokens` và CSS import từ chối toàn bộ batch nếu có thay đổi token đã khóa; `apply_theme` loại các thuộc tính khóa khỏi bản áp dụng và trả danh sách đã giữ lại. Agent không có tool mở khóa, xóa hệ thống, cài package, chạy lệnh hoặc publish. Giá trị có thể khôi phục từ lịch sử editor.

## Dùng theme trong dự án

### Khám phá thư viện theme

Mở **Thư viện theme** ở thanh bên hoặc trên toolbar. Thư viện có sáu preset Token Studio gốc và **42 bộ màu phỏng theo tweakcn**, kèm tên và nguồn; tìm kiếm theo tên/nguồn hoặc lọc Studio, tweakcn, Của bạn. Danh sách Của bạn lấy từ các design system đã lưu trên máy.

Chọn một theme để xem trước màu sáng/tối trên card, biểu đồ, input và button. Thao tác xem thử không lưu dữ liệu. **Áp dụng hiện tại** giữ nguyên tên hệ thống và mọi giá trị đã khóa, hiển thị số giá trị sẽ thay đổi và lưu một bước lịch sử có thể undo. **Tạo hệ thống mới** yêu cầu tên mới và lưu một bản sao; hệ thống cũ được giữ nguyên. Nút Tạo design system cũng mở trực tiếp thư viện này.

Các preset được chuyển sang model hiện có: 32 màu/chế độ, font được hỗ trợ và bo góc. Font riêng của bản gốc được thay bằng font local tương ứng; shadow riêng chưa hỗ trợ. Đọc **Nguồn & thuộc tính tương thích** trong preview để biết các thay thế. Không bảo đảm mọi theme sẵn có đạt AA; số cặp chữ/nền cần kiểm tra được hiển thị theo đúng bản xem trước, kể cả khi giữ token khóa.

Dữ liệu theme được đóng gói local từ [tweakcn](https://github.com/jnsahaj/tweakcn), phiên bản ghim `a3b47b37cba97dd637de517aab52c45ec0f83456`, giấy phép Apache-2.0. Xem `third_party/tweakcn/NOTICE.md` và `LICENSE`. Mã giao diện Token Studio được xây riêng. Làm mới dữ liệu có chủ đích bằng `npx tsx scripts/sync-theme-catalog.ts`; script chỉ đọc object literal, không thực thi mã tải về. Ứng dụng đang chạy không phụ thuộc kết nối tới tweakcn.

Agent dùng `list_themes` → `get_theme` → `apply_theme` (`apply: false` để xem trước; `apply: true` cần `expectedRevision`). `create_system` nhận `themeId` khi tạo từ thư viện, và vẫn giữ preset 0–5 cho client cũ. Resource `token-studio://themes` liệt kê ID thật. Thư viện không phải registry React component.

### Xuất theme vào dự án

1. Chọn **Xuất CSS** → sao chép hoặc tải file.
2. Giữ các lệnh Tailwind/shadcn `@import` hiện có trong `globals.css`. Thay các khối `:root`, `.dark`, mapping `@theme inline` bằng theme vừa xuất; tránh giữ hai bộ khai báo xung đột.
3. CSS dùng màu đầy đủ, dành cho Tailwind v4. Dự án Tailwind v3 dùng `hsl(var(--primary))` cần chuyển cấu hình màu trước.
4. Đưa class `.dark` lên phần tử gốc để bật chế độ tối. Khi chọn font Inter trong dự án đích, cần tự load font Inter; editor đã có font cục bộ riêng.

Export không bao gồm mã React của component preview. Các mẫu được xây bằng React/CSS để kiểm tra token và khả năng tương tác; đây chưa phải registry component có thể cài bằng shadcn CLI.

## Dữ liệu và sao lưu

Mặc định: `data/studio.json`, tính từ thư mục dự án. Dữ liệu ghi qua file tạm rồi rename, và validate khi đọc. File lỗi không bị tự ghi đè bằng dữ liệu mẫu.

- Sao lưu toàn bộ file trên để giữ cả hệ thống, lịch sử, khóa và nhật ký MCP.
- Export JSON chỉ chứa snapshot một hệ thống, không chứa lịch sử.
- `STUDIO_DATA_FILE`: đổi đường dẫn dữ liệu. `PORT`: đổi cổng HTTP/MCP; Vite development proxy mặc định vẫn dùng 4318, nên cần chỉnh `vite.config.ts` nếu đổi cổng khi chạy dev.
- Không chạy hai HTTP server trỏ vào cùng một file dữ liệu. Mọi client stdio nên đi qua HTTP server duy nhất.

Server chỉ bind `127.0.0.1`, kiểm tra Host và Origin cho giao diện local. Đây là công cụ dùng trên máy cá nhân, không phải server nhóm được xác thực; các chương trình local có thể gọi nó. Nếu mở ra internet hoặc mạng nhóm, cần bổ sung xác thực và quản lý quyền.

## Kiểm tra

```powershell
npm test
npm run typecheck
npm run build
```

Tests dùng dữ liệu tạm, kiểm tra atomic update, khóa token, optimistic concurrency, lịch sử, CSS roundtrip, màu và tương phản, file hỏng, và MCP HTTP/stdio bằng SDK client thật. Kiểm thử tích hợp khởi động một server riêng ở cổng 14328.

## Phạm vi

Bản này hoàn thiện phạm vi **Editor + MCP local**. Chưa có đồng bộ Figma, tự trích xuất theme từ URL, thực thi yêu cầu AI ngay trong editor, custom React component builder, ProBlocks, shadcn registry, tài khoản nhiều người hoặc cloud sync. AI đến từ client MCP bạn kết nối và có thể chịu phí theo gói của nhà cung cấp đó. Không có tính năng trả phí hay nội dung độc quyền của shadcndesign được sao chép.

Mã nguồn ứng dụng dùng MIT; các thư viện và font giữ giấy phép riêng. Xem `LICENSE`. Thiết kế tham chiếu nội bộ: `docs/concept.png`; ảnh editor thực tế: `docs/editor-desktop.png` và `docs/editor-mobile.png`.

## Fluento — web học tiếng Anh 1 kèm 1

Ứng dụng mẫu riêng trong `apps/english-one`, thiết kế bằng workflow Token Studio + shadcn/ui cho quản trị trung tâm và giáo viên. Chạy `npm --prefix apps/english-one install`, sau đó `npm run english:dev`; mở http://127.0.0.1:5174/. Có thể dùng `Start Fluento.cmd`. Hướng dẫn, phạm vi và ảnh kiểm tra nằm trong [apps/english-one/README.md](apps/english-one/README.md). Token Studio và MCP vẫn chạy độc lập theo hướng dẫn phía trên.
