# Thẻ buổi học kế tiếp cho giáo viên — đặc tả

Phiên bản đặc tả: 1.0, ngày 2026-10-19, Asia/Bangkok.
Trạng thái: hoàn tất đặc tả trong phạm vi grill-me; chưa triển khai sản phẩm.
Nguồn yêu cầu: BRIEF.md, nội dung được giao trong chính phiên Codex desktop này.
Workflow được yêu cầu: 1.4.0; hồ sơ schemaVersion 2, mode grill-me, scope screen.

## 1. Người dùng, mục tiêu và thành công

Giáo viên đọc thẻ để biết buổi học kế tiếp gồm ai học, ai dạy, học lúc nào và mục tiêu gì. Thành công của phiên này là tài liệu mô tả rõ phạm vi và cả hai tình huống có buổi học / chưa có lịch, cùng chứng cứ kiểm tra độ đầy đủ. Không có CTA nghiệp vụ: đọc thông tin là tác vụ duy nhất. Không có tuyên bố đo lường hiệu quả hoặc xác nhận từ người dùng cuối. [D-01, D-05, D-06]

## 2. Phạm vi và giới hạn

R-01: Chỉ đặc tả một thẻ đọc thông tin buổi học kế tiếp dành cho giáo viên. Không dựng trang hoặc viết mã sản phẩm. [D-01, D-06]

R-02: Khi có buổi học, nội dung nghiệp vụ chỉ gồm bốn trường: Học viên, Giáo viên, Giờ, Mục tiêu buổi học. Tiêu đề, nhãn trường và nhãn synthetic chỉ hỗ trợ đọc nội dung. Không thêm email, số điện thoại, ảnh hồ sơ, học phí, điểm số, đường dẫn phòng học hoặc chỉ số hoạt động. [D-02]

R-03: Toàn bộ dữ liệu minh họa là synthetic. Nhãn hiển thị phải ghi rõ “Dữ liệu mẫu (synthetic) — không phải lịch thật” ở cả hai tình huống. Không mô phỏng kết nối, tài khoản hoặc dữ liệu thật. [D-03]

R-04: Không có đặt lịch, hủy lịch hoặc đổi lịch; không có nút, menu, liên kết, biểu mẫu hay hành vi ngầm thực hiện các tác vụ đó. Không có backend, thanh toán hoặc AI. [D-04]

R-05: Đầu vào minh họa có hai trạng thái độc lập: có buổi học và chưa có lịch. Đây là hợp đồng tài liệu; không viết bộ chuyển trạng thái hoặc thuật toán chọn lịch. [D-05]

R-06: Không chạy implementation snapshot, browser/render, build hay test sản phẩm trong phiên grill-me. Chỉ kiểm tra tài liệu và hồ sơ bằng snapshot plan, kiểm tra coverage và verify --write. [D-06, D-07]

Không yêu cầu tài khoản, đăng nhập, đồng bộ, lưu trữ cục bộ, API, truy vấn lịch hoặc nhà cung cấp ngoài. Không xác lập quyền thay đổi dữ liệu vì không có thao tác ghi. [D-03, D-04]

## 3. Hợp đồng dữ liệu minh họa

Nguồn duy nhất là ví dụ tĩnh trong tài liệu này, không đọc lịch của bất kỳ cá nhân nào. Các tên và giờ dưới đây do tác giả đặt hoàn toàn synthetic trong phạm vi brief; không phải tên hoặc lịch được người dùng xác nhận. “Buổi học kế tiếp” là mẫu được chỉ định sẵn, không phải kết quả so sánh với đồng hồ thực hoặc một danh sách lịch thật. [D-01, D-03]

| Nhãn hiển thị | Giá trị synthetic khi có buổi học |
| --- | --- |
| Học viên | Học viên Mẫu A |
| Giáo viên | Giáo viên Mẫu B |
| Giờ | 09:00 ngày 21/10/2026 (UTC+07:00, giờ mẫu) |
| Mục tiêu buổi học | Luyện giới thiệu bản thân bằng 5 câu đơn giản. |

Ngày, giờ và UTC+07:00 là một giá trị minh họa đầy đủ để tránh hiểu nhầm; không phải quy tắc múi giờ của một dịch vụ. Không thêm trường nghiệp vụ mới ngoài bốn trường trên. Mẫu có buổi học cung cấp đầy đủ cả bốn giá trị. Mẫu chưa có lịch không có đối tượng buổi học, không gán tên, giờ hay mục tiêu mặc định để trông giống buổi học thật. Không chép lại thông tin từ lần hiển thị khác. [D-02, D-03, D-05]

## 4. Hai hành trình và kết quả quan sát được

### J-01 — Có buổi học

Cho trước ví dụ tĩnh có buổi học và bốn giá trị ở mục 3. Khi giáo viên đọc thẻ trong mô tả này, thẻ mang tiêu đề “Buổi học kế tiếp”, hiển thị nhãn “Dữ liệu mẫu (synthetic) — không phải lịch thật”, cùng bốn cặp nhãn/giá trị Học viên, Giáo viên, Giờ và Mục tiêu buổi học. Giáo viên đọc được người học, người dạy, thời điểm kèm ngày/múi giờ mẫu và mục tiêu mà không thao tác ghi dữ liệu. Không có CTA đặt/hủy/đổi lịch. [R-01–R-05]

### J-02 — Chưa có lịch

Cho trước ví dụ tĩnh không có buổi học. Khi giáo viên đọc thẻ, tiêu đề vẫn là “Buổi học kế tiếp”, nhãn “Dữ liệu mẫu (synthetic) — không phải lịch thật” vẫn hiện. Nội dung chính là “Chưa có lịch học kế tiếp.” Không hiển thị bốn giá trị của J-01, không tạo lịch mới, không hiển thị giờ ước đoán và không đưa ra CTA đặt/hủy/đổi lịch. Đây là trạng thái rỗng có chủ đích, không phải lỗi mạng hoặc trạng thái đang tải. [R-03–R-05]

## 5. Ràng buộc UX ở mức đặc tả

Ưu tiên nội dung: nhận biết tiêu đề và tính synthetic, rồi đọc bốn trường nghiệp vụ; khi rỗng thì đọc thông báo chưa có lịch. Thẻ là vùng thông tin chỉ đọc, nhãn và giá trị phải liên hệ rõ bằng ngữ nghĩa văn bản, không chỉ bằng màu hoặc biểu tượng. Nội dung dài cần xuống dòng để giữ nguyên tên và mục tiêu; không dùng tooltip làm nơi duy nhất chứa thông tin thiết yếu.

Phạm vi này không chọn theme, font, kích thước pixel, thư viện icon hay hình thức trang trí. Không có brand, reference hoặc hướng thẩm mỹ được con người chọn trong brief. Các lựa chọn đó chưa được chốt cho một lần triển khai sau; chúng không cản nghiệm thu tài liệu đúng phạm vi hiện tại. Không suy diễn “brief đã đủ” thành phê duyệt một hướng thẩm mỹ cụ thể.

Nếu sau này được yêu cầu dựng UI, cần kiểm tra hệ thống token và component thực tế của dự án, chọn hướng thị giác khi cần, rồi kiểm tra hiển thị trên desktop/mobile, bàn phím, zoom, độ tương phản và nội dung dài. Các bước đó chưa được thực hiện ở đây. Không có loading/error/retry/success-submit/hover/focus/disabled của điều khiển vì không có mạng, gửi dữ liệu hoặc điều khiển tương tác trong hợp đồng hiện tại. Chưa có chứng cứ render hoặc chứng nhận accessibility.

## 6. Quyết định có nguồn

Tất cả D-01–D-07 có trạng thái resolved, source human, dựa trên các trích đoạn của BRIEF.md; không có vòng phỏng vấn mới hoặc câu trả lời được tạo thêm.

| ID | Quyết định | Nguồn brief | Hệ quả |
| --- | --- | --- | --- |
| D-01 | Đặc tả thẻ chỉ đọc buổi học kế tiếp cho giáo viên | “đặc tả thẻ đọc thông tin buổi học kế tiếp cho giáo viên” | Một tác vụ đọc, không có CTA nghiệp vụ |
| D-02 | Chỉ bốn trường nghiệp vụ | “Chỉ hiển thị học viên, giáo viên, giờ và mục tiêu buổi học” | Không thêm dữ liệu hồ sơ hay thống kê |
| D-03 | Mẫu synthetic, không giả dữ liệu thật | “dữ liệu mẫu ghi rõ synthetic”; “không giả lập dữ liệu thật” | Nhãn synthetic ở cả hai tình huống |
| D-04 | Loại các thao tác và dịch vụ ngoài phạm vi | “Không đặt/hủy/đổi lịch, không backend, thanh toán hoặc AI” | Không có thao tác ghi, tích hợp hoặc phát sinh dịch vụ |
| D-05 | Hai tình huống bắt buộc | “Tình huống chính có buổi học; tình huống thay thế chưa có lịch” | J-01 và J-02 độc lập, không có giá trị lịch bịa ở trạng thái rỗng |
| D-06 | Chỉ đặc tả và hồ sơ trong grill-me | “chỉ tạo đặc tả và hồ sơ v2 ... không viết sản phẩm”; “Nghiệm thu ở mức đặc tả” | Không đánh dấu hành vi sản phẩm đã chạy |
| D-07 | Bằng chứng local bằng helper plan/verify | “Dùng helper snapshot plan và verify --write”; “không thực hiện implementation snapshot hoặc render” | Fingerprint plan, hash thật, báo giới hạn MCP |

## 7. Tiêu chí nghiệm thu tài liệu

Các Given/When/Then sau kiểm tra nội dung đặc tả, không tuyên bố màn hình đã được chạy. Mỗi AC liên kết một acceptance check, các artifact A-SPEC và A-COVERAGE cùng fingerprint của snapshot plan trong task.json.

- AC-01 [D-01, D-06; R-01]: Cho brief dành cho giáo viên, khi đọc mục 1–2, tài liệu xác định đúng người dùng, thẻ chỉ đọc, kết quả nghiệm thu tài liệu và ranh giới không viết sản phẩm.
- AC-02 [D-02, D-05; R-02; J-01]: Cho tình huống có buổi học, khi đọc mục 3–4, đủ chính xác bốn trường Học viên, Giáo viên, Giờ và Mục tiêu buổi học, có giá trị mẫu cụ thể và thời gian không mơ hồ; không có trường nghiệp vụ thứ năm.
- AC-03 [D-03, D-05; R-03; J-01, J-02]: Cho cả hai tình huống, khi đọc mục 3–4, có nhãn synthetic rõ ràng, tên/giờ là mẫu và không được trình bày như dữ liệu thật hoặc kết nối thật.
- AC-04 [D-05, D-03; R-05; J-02]: Cho chưa có lịch, khi đọc J-02, đặc tả nêu thông báo rỗng, không dùng giá trị từ J-01, không bịa lịch hoặc giờ mặc định.
- AC-05 [D-04; R-04]: Khi đọc phạm vi và cả hai hành trình, không có đặt/hủy/đổi lịch hoặc CTA tương ứng; backend, thanh toán và AI đều được loại khỏi phạm vi.
- AC-06 [D-03, D-04, D-05; mục 3–5]: Khi kiểm tra hợp đồng dữ liệu, tài liệu chỉ dùng ví dụ tĩnh; không yêu cầu API, lưu trữ, tài khoản, kết nối thật hoặc thuật toán lịch; loading/error mạng không được giả lập như tính năng đã chạy.
- AC-07 [D-06, D-07; R-06]: Khi kiểm tra bàn giao, đầu ra là SPEC.md và hồ sơ v2 trong workspace; mode grill-me, implementation inputs rỗng, không có implementation snapshot hoặc artifact render.
- AC-08 [D-06, D-07; mục 6–7]: Khi kiểm tra hồ sơ, mỗi AC có decisionIds từ brief và acceptance check liên kết criterionIds/artifactIds, fingerprint plan cùng SHA-256 của tệp bằng chứng thực.
- AC-09 [D-07; mục 8]: Khi đọc bằng chứng phiên client, metadata được phân biệt với workflow/schema, helper được chạy thật và báo giới hạn local/MCP, không nhận là chứng nhận thẩm mỹ.

## 8. Bàn giao và giới hạn chứng cứ

Đọc COVERAGE.md để xem đối chiếu từng AC với vị trí trong SPEC.md; đọc CLIENT-EVIDENCE.json để xem metadata quan sát và so sánh hash tệp skill; đọc plan-snapshot.json và verify-report.json để xem stdout helper thực tế. Hồ sơ chính nằm ở .token-studio/tasks/<UUID>/task.json tại workspace này, UUID cụ thể nằm trong hồ sơ và bản sao outputs/task.json.

Không có Token Studio MCP trong danh mục công cụ khả dụng tại lần kiểm tra của phiên này, nên không đồng bộ Studio hoặc gọi validate_task/complete_task. Việc helper local đạt chỉ xác minh hồ sơ, truy vết, tệp và hash theo chính sách helper; không xác thực độc lập ý định, thẩm mỹ hay hành vi màn hình. Không có implementation snapshot, render, browser, deployment hoặc sản phẩm được viết. Không gửi tin nhắn sang chat khác, không sửa cấu hình/quyền/MCP/ứng dụng khác.

Không có câu hỏi nghiệp vụ còn mở ảnh hưởng đến nghiệm thu đặc tả theo brief. Hướng thị giác và chi tiết nền tảng triển khai chưa được quyết định và cần được xử lý nếu có yêu cầu triển khai sau. Tài liệu này không cấp phép triển khai tiếp.
