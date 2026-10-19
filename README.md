# Token Design Studio

## 0.3.2: bổ sung icon và minh họa nét vẽ tay từ Koboyo

Khi hướng thiết kế đã chọn cần nét vẽ tay, workflow ưu tiên [Koboyo Icons](https://koboyo.com/icons): chọn kiểu nét nhất quán, xác minh trang/slug thật, dùng SVG local và ghi nguồn cùng điều kiện sử dụng. [Giấy phép Koboyo](https://koboyo.com/icons/license) có giới hạn phân phối lại và công cụ chọn/xuất icon; Studio và package chỉ chứa hướng dẫn, không đóng gói tài nguyên Koboyo. Xem [kiểm chứng bản vá](docs/releases/0.3.2.md).

### Ưu tiên Icones cho icon giao diện

Workflow 1.3.2 ưu tiên [Icones](https://icones.js.org/) khi chọn icon mới: chọn một family phù hợp, kiểm chứng ID và giấy phép, ghi nguồn trong đặc tả/bàn giao. Khi tinh chỉnh dự án, giữ family và cách import hiện có; không tự thay toàn bộ icon. Skill, MCP và bản hướng dẫn xuất từ Studio dùng chung quy tắc này. Xem [kiểm chứng bản vá](docs/releases/0.3.1.md).

### Cài skill gọn và theo dõi tác vụ

Bản ứng dụng local và package skill riêng đã được triển khai. Chưa publish npm; xem [kiểm chứng và giới hạn client](docs/releases/0.3.0.md). Quy trình 1.3.2 ghi hồ sơ trong dự án và chặn đánh dấu hoàn tất trong Studio khi thiếu bằng chứng bắt buộc.

Sau khi package skill được publish:

```sh
npx token-design-studio-skill@latest install --client codex
npx token-design-studio-skill@latest install --client antigravity
```

Trước khi publish, gửi tarball `token-design-studio-skill-0.3.2.tgz` cho người nhận:

```sh
npm exec --yes --package=./token-design-studio-skill-0.3.2.tgz -- token-design-studio-skill install --client codex
npm exec --yes --package=./token-design-studio-skill-0.3.2.tgz -- token-design-studio-skill install --client antigravity
```

Node 22.12+. Gói skill không tải editor/server hoặc dependency runtime bên ngoài, không sửa MCP. Codex dùng `CODEX_HOME` hoặc `~/.codex`; Antigravity **IDE/app** dùng `~/.gemini/config/skills` (khác Antigravity CLI). `--home PATH` chọn thư mục cấu hình client để cài vào môi trường riêng. File Codex `agents/openai.yaml` không được cài sang Antigravity. Mở phiên client mới sau khi cài.

### Hồ sơ thiết kế

Lưu `.token-studio/tasks/<UUID>/task.json` dạng `{ "taskId": "UUID", "task": { ... } }`; tài liệu và ảnh nằm cạnh hồ sơ, đường dẫn bằng chứng tính từ gốc dự án. Mẫu và JSON schema có trong skill. Bộ kiểm tra offline: `node <thư-mục-skill>/scripts/validate-task.cjs <đường-dẫn/task.json>`. Khi có MCP, dùng `create_task`, `list_tasks`, `get_task`, `update_task`, `validate_task`, `complete_task`; có 17 tool, gồm 11 tool cũ. Cập nhật yêu cầu revision tác vụ mới nhất và mở lại tác vụ đã hoàn tất. UI **Tác vụ thiết kế** hiển thị điều kiện còn thiếu và cho đồng bộ JSON, tải hồ sơ, hoàn tất.

Studio lưu bản ghi đồng bộ vào `tasks.json` cạnh `studio.json`; không tự đọc file, tải ảnh từ URL hoặc sửa hồ sơ trong dự án. Khi di chuyển kho 0.3.0, sao lưu cả hai file; lệnh `migrate` vẫn chỉ sao chép kho theme cũ. Dữ liệu theme cũ không đổi định dạng. Liên kết ảnh và thông tin test do agent/người dùng cung cấp, không phải chứng nhận thẩm mỹ hoặc bằng chứng đã được xác thực độc lập.

Developer: `npm run pack:skill`, `npm run test:skill-package`, `npm run pack:local`, `npm run test:package`. Dựng lại bản vá riêng: `npm run pack:legacy`, rồi `npm run test:package -- output/npm/token-design-studio-0.2.1.tgz`; source mốc 0.2.1 được giữ riêng, có backport sửa lỗi đối chiếu đường dẫn thực. Benchmark tác vụ dùng fixture tổng hợp và chỉ chạy chủ động; đọc [báo cáo đánh giá](docs/evaluation/REPORT.md) trước khi kết luận chất lượng.


### 0.2.1 — bộ cài có khả năng phục hồi

Bộ cài skill dùng staging, khóa cùng đích, kiểm tra lại nội dung trước khi thay, backup và nhật ký phục hồi. Setup Codex hoàn nguyên thay đổi của giao dịch khi thất bại; nếu cấu hình bị tiến trình khác chỉnh, giữ nguyên để đối chiếu với backup. `install-skill` hoạt động độc lập với `PORT`. Chi tiết: [release 0.2.1](docs/releases/0.2.1.md).

Trình quản lý design system chạy local, có editor tiếng Việt và MCP server thật. Bạn sở hữu mã nguồn và dữ liệu, không cần tài khoản hoặc thuê bao Token Studio.

Bạn có thể cài riêng **skill thiết kế cho Codex**, hoặc dùng thêm **editor + MCP** để quản lý và đồng bộ theme.

## Cài riêng skill cho Codex

Yêu cầu Node.js 22.12+ với npm và Codex hỗ trợ skill local. Sau khi package được phát hành công khai lên npm, người dùng trên máy khác cài bằng một lệnh:

```sh
npx token-design-studio@latest install-skill
```

Lệnh tải package và cài skill vào máy của người chạy: `~/.codex/skills/token-studio-shadcn`, hoặc `$CODEX_HOME/skills/token-studio-shadcn` nếu đã đặt CODEX_HOME. Trên Windows, thư mục mặc định nằm trong `%USERPROFILE%\.codex\skills\token-studio-shadcn`.

Không cần clone repo, build mã nguồn, khởi động editor hoặc cấu hình MCP để dùng riêng quy trình thiết kế. Gói vẫn cài các dependency runtime của nó qua npm; `install-skill` chỉ thực hiện thao tác cài/cập nhật skill, không chạy server hay đổi cấu hình MCP. Mở **phiên Codex mới** sau khi cài, rồi dùng:

```text
$token-studio-shadcn Thiết kế trang quản lý học viên tiếng Anh 1–1.
Phỏng vấn các điểm quan trọng chưa rõ, chốt hướng thiết kế,
tạo SPEC.md rồi triển khai và phản biện bản render.
```

Để chỉ phỏng vấn và tạo đặc tả:

```text
$token-studio-shadcn Grill me về ý tưởng ứng dụng của tôi.
Hỏi để làm rõ, tạo SPEC.md và dừng trước khi viết code.
```

Skill cung cấp quy trình phỏng vấn, định hướng thiết kế, đặc tả, tái sử dụng component, triển khai và phản biện. Khi không kết nối MCP Token Studio, agent dùng token của dự án và phải nói rõ chưa đồng bộ với editor. Muốn agent đọc/ghi theme trong Studio thì dùng thêm editor + MCP.

### Chia sẻ cho người khác

Sau khi publish thành công, gửi cho người nhận lệnh `npx token-design-studio@latest install-skill` cùng tên skill `$token-studio-shadcn`. Người nhận không cần quyền truy cập repo GitHub private; npm tải nội dung package công khai về máy của họ.

Nội dung có thể gửi:

> Cài Node.js 22.12+ và có Codex hỗ trợ skill local. Chạy `npx token-design-studio@latest install-skill`, mở phiên Codex mới, rồi gọi `$token-studio-shadcn` kèm yêu cầu thiết kế. Skill sẽ phỏng vấn, chốt hướng, tạo đặc tả, triển khai và phản biện theo phạm vi bạn yêu cầu.

**Các lệnh `@latest` trong phần này chỉ dùng được sau khi package đã có trên npm registry.** Nếu chưa publish, có thể gửi file `token-design-studio-0.3.0.tgz` cho người nhận. Trong thư mục chứa file, họ chạy:

```sh
npm exec --yes --package=./token-design-studio-0.3.0.tgz -- token-design-studio install-skill
```

Để cập nhật skill, chạy lại lệnh cài phù hợp. Bản được quản lý chưa chỉnh riêng được cập nhật có sao lưu; nếu đã chỉnh riêng, bộ cài dừng để đối chiếu thay vì ghi đè.

### Chọn lệnh theo nhu cầu

| Lệnh CLI | Kết quả |
| --- | --- |
| `install-skill` | Chỉ cài/cập nhật quy trình cho Codex; không cần server hoặc Codex CLI |
| `setup codex` | Cài skill và đăng ký HTTP MCP bằng Codex CLI; giữ Studio chạy khi agent dùng MCP |
| `start` hoặc không truyền lệnh | Chạy editor + HTTP MCP local và mở trình duyệt |
| `mcp` | Adapter stdio kết nối tới Studio đang chạy |

## Cài editor và MCP từ gói npm local

Yêu cầu Node.js 22.12+ và npm. Bản 0.3.0 được chuẩn bị dưới dạng `.tgz`, **chưa phát hành lên npm registry**. Tải hoặc lấy file `output/npm/token-design-studio-0.3.0.tgz` rồi chạy trong thư mục chứa file:

```powershell
npm install -g ./token-design-studio-0.3.0.tgz
token-design-studio
```

Lệnh mở editor tại **http://127.0.0.1:4318** và HTTP MCP tại **http://127.0.0.1:4318/mcp**. Giữ terminal mở; Ctrl+C để dừng. Gói đã chứa editor và runtime build sẵn; máy sử dụng không cần Git, Vite, TypeScript hoặc bước build. Không có script postinstall tự sửa máy. Có thể dùng tarball không cài global: `npm exec --yes --package=./token-design-studio-0.3.0.tgz -- token-design-studio`.

Kết nối Codex một lần, sau khi đã cài Codex CLI:

```powershell
token-design-studio setup codex
```

Setup cài skill và dùng lệnh chính thức `codex mcp add` để đăng ký HTTP MCP. Mở phiên Codex mới để tải cấu hình/skill; Studio cần đang chạy khi agent gọi MCP. Adapter stdio: `token-design-studio mcp`. Chưa có daemon hoặc dịch vụ autostart ngầm.

Các lệnh khác: `token-design-studio --help`, `install-skill`, `doctor`, `--no-open`, `--port 4319`, `--data-dir "đường dẫn"`. Một phiên tương thích cùng dữ liệu/phiên bản được tái sử dụng; khác kho hoặc khác phiên bản sẽ được thông báo. Port của ứng dụng khác không bị chiếm. Khóa dữ liệu ngăn hai server cùng ghi một kho kể cả khác port; sau khi tiến trình bị kết thúc đột ngột, khóa có thể cần khoảng 10 giây để hết hạn.

Dữ liệu CLI mặc định nằm tại `%LOCALAPPDATA%/TokenDesignStudio/studio.json` trên Windows, `~/Library/Application Support/TokenDesignStudio/studio.json` trên macOS, hoặc `$XDG_DATA_HOME/token-design-studio/studio.json` (mặc định `~/.local/share/...`) trên Linux. Không lưu trong package hoặc cache npm; nâng cấp/cài lại không ghi đè dữ liệu.

Để chuyển dữ liệu từ repo cũ, dừng phiên cũ, chạy `token-design-studio migrate "đường dẫn repo/data/studio.json"` trước lần khởi động CLI đầu tiên. Lệnh kiểm tra dữ liệu, giữ nguyên nguồn và từ chối ghi đè kho đích đã tồn tại. Hoặc dùng `--data-dir "đường dẫn repo/data"` để tiếp tục dùng trực tiếp kho cũ. Repo phát triển vẫn dùng `data/studio.json` như trước, không tự di chuyển dữ liệu.

Skill cài bởi CLI được theo dõi bằng hash: cập nhật bản được quản lý chưa chỉnh riêng có sao lưu; file đã chỉnh riêng hoặc bản cũ khác nội dung nhưng chưa được quản lý sẽ yêu cầu đối chiếu, không tự ghi đè. Setup sao lưu cấu hình Codex trước khi thay; giữ cấu hình khác. Nếu tên MCP `token-studio` đã có cấu hình khác, mặc định dừng; `setup codex --replace-mcp` cho phép thay riêng kết nối đó có chủ đích.

Sau khi có một bản phát hành npm công khai, dùng `npx token-design-studio@latest`. Package đã bỏ cờ `private` theo yêu cầu của chủ dự án để cho phép phát hành. Hiện vẫn dùng tarball cho đến khi publish thành công lên registry.

## Phát triển từ mã nguồn

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

Tạo và kiểm tra tarball bằng `npm run pack:local`, sau đó `npm run test:package`. Bộ kiểm tra cài tarball với `--omit=dev --ignore-scripts` trong thư mục sạch, dùng kho dữ liệu và CODEX_HOME tạm. Xem [đặc tả phân phối](docs/npm-cli/SPEC.md).

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
- Quy trình Design & Ship bảy bước, skill Codex, tool `get_workflow`, hai prompt `grill_me` / `design_and_ship` và năm resource hướng dẫn.
- Định hướng thiết kế theo tác vụ; tự kiểm tra trước code và phản biện bản render có bằng chứng. Hướng dẫn chất lượng có trong skill, MCP và file tải từ editor.

## Quy trình làm việc cho agent

Agent làm việc theo bảy bước: **Đọc bối cảnh → Grill me / phỏng vấn → Kiểm kê & tái sử dụng → Hoàn thiện đặc tả → Triển khai → Kiểm chứng → Bàn giao**. Mỗi bước có đầu ra và điều kiện hoàn thành. Quy trình ưu tiên component đã cài, block phù hợp từ registry chính thức/của dự án, rồi mới xây phần còn thiếu. Các API, item ID và giấy phép phải được kiểm tra khi dùng; không cần mua ProBlocks.

Từ workflow **1.2.0**, hai mốc tự kiểm tra là bắt buộc trong hướng dẫn: phản biện hướng thiết kế trước code và đánh giá bản render trước bàn giao. Nếu thiết kế mới chưa có thương hiệu hoặc tham chiếu rõ, agent đề xuất **hai hướng ngắn, khác biệt và có lý do**, rồi hỏi người dùng chọn, trừ khi đã được giao quyền quyết định. Khi hướng đã rõ, agent tiếp tục trong phạm vi được yêu cầu, không thêm vòng xin duyệt. Sửa token nhỏ, dựng theo ảnh và tinh chỉnh sản phẩm hiện có dùng quy trình tương xứng.

Hợp đồng thiết kế nêu ưu tiên nội dung, bố cục, mật độ, typography và mỗi section giúp người dùng hiểu/quyết định/làm gì. Review sau render ghi vị trí, bằng chứng quan sát được, ảnh hưởng, mức độ, cách sửa và kết quả kiểm tra lại. Sửa lỗi chặn tác vụ và vấn đề lớn trong phạm vi trước khi tuyên bố hoàn tất; nêu rõ giới hạn bên ngoài. Không cấm tuyệt đối card, gradient, font hay màu phổ biến; không dùng điểm "AI slop" tùy ý hoặc ép thiết kế phải lạ. Xem [hướng dẫn thiết kế & phản biện](skills/token-studio-shadcn/references/design-quality.md) và [nghiên cứu](docs/design-quality/RESEARCH.md).

Bốn chế độ: `grill-me` (phỏng vấn và tạo đặc tả), `design-and-build` (xây mới), `replicate` (dựng theo tham chiếu), `refine` (sửa giao diện hiện tại). Các chế độ triển khai cũng phỏng vấn khi còn quyết định quan trọng chưa rõ. Kiểm chứng riêng độ khớp thiết kế và hành vi; không tuyên bố pixel-perfect, production-ready, tăng tốc 10x hoặc tăng conversion khi chưa có bằng chứng.

Trang **Kết nối MCP → Quy trình Design & Ship** hiển thị bảy bước, mặc định chế độ **Grill me · Phỏng vấn → Đặc tả**, cho viết ý tưởng, sao chép yêu cầu phỏng vấn và tải hướng dẫn kèm mẫu SPEC.md. Agent thực hiện cuộc phỏng vấn trong client AI; editor không tự mở một phiên chat AI.

Phỏng vấn mặc định một câu mỗi vòng, tối đa ba câu liên quan. Agent đọc các câu trả lời đã có, hỏi sâu vào ví dụ và ngoại lệ, giải quyết mâu thuẫn và ghi sổ quyết định: đã xác nhận / bằng chứng dự án / được giao quyết định / còn mở / mâu thuẫn. Không coi im lặng là chọn mặc định; câu hỏi quan trọng cần trả lời trước phần triển khai phụ thuộc. Khi người dùng đã giao quyền quyết định trong một phạm vi, agent ghi rõ nguồn giao quyền và tiếp tục trong phạm vi đó.

Đầu ra là **SPEC.md** gồm người dùng, kết quả mong muốn, phạm vi và phần loại trừ, hành trình, quy tắc nghiệp vụ, dữ liệu/tích hợp, ràng buộc UX, tiêu chí nghiệm thu Given/When/Then, nguồn quyết định và câu hỏi còn mở. `grill-me` dừng ở đặc tả; các chế độ xây dựng tiếp tục khi đã đủ thông tin và đã có yêu cầu triển khai.

Nếu đang phát triển từ repo, có thể cài skill cho Codex trực tiếp từ mã nguồn. Người chỉ muốn dùng hoặc chia sẻ skill xem phần **Cài riêng skill cho Codex** ở đầu README.

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

Để chỉ phỏng vấn: `$token-studio-shadcn Grill me về ý tưởng [mô tả]. Hỏi để làm rõ rồi tạo SPEC.md, chưa viết code.` Với client MCP khác, gọi `get_workflow` với `mode: "grill-me"` hoặc chọn prompt `grill_me` với `task`. Triển khai đầy đủ dùng `design_and_ship` với `task` và `mode`. Initialize response cũng hướng dẫn agent đọc quy trình. Resource gồm `token-studio://workflow`, `token-studio://workflow/interview`, `token-studio://workflow/reuse`, `token-studio://workflow/design-quality`, `token-studio://workflow/handoff`. `get_workflow` trả thêm `designQualityGuide`; adapter stdio chuyển tiếp prompts và resources giống HTTP. File tải từ editor gồm toàn bộ hướng dẫn, giữ chỉ dẫn kết thúc ở SPEC.md cho chế độ grill-me.

Đây là hướng dẫn cho agent, không phải cơ chế cưỡng chế thực thi. Client có thể không hiển thị prompts/resources; tool `get_workflow` vẫn đọc được toàn bộ quy trình. Nếu không có MCP Token Studio, skill có thể dùng token của dự án và phải nói rõ chưa đồng bộ với editor. Việc deploy/publish vẫn tuân theo phạm vi người dùng đã cho phép.

Nguồn chuẩn để sửa quy trình nằm trong `skills/token-studio-shadcn/`. MCP đọc trực tiếp các file này khi server khởi động; nếu sửa file, khởi động lại server và cài lại skill sau khi đối chiếu bản đang dùng. Không có bản hướng dẫn riêng bị sao chép vào từng handler.

## Kết nối Codex

Khởi động Token Studio trước, sau đó:

```powershell
codex mcp add token-studio --url http://127.0.0.1:4318/mcp
```

Mở một phiên Codex mới để tải server. Với Codex desktop, có thể thêm HTTP MCP server trong Settings theo URL trên. Đây là server local không cần OAuth hoặc API key. Editor không tự sửa cấu hình Codex; lệnh CLI `setup codex` thực hiện việc đăng ký có sao lưu khi bạn chủ động chạy.

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
