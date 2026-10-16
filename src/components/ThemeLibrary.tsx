import { useMemo, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Layers,
  LockKeyhole,
  Moon,
  Palette,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import {
  contrastReport,
  tokenNames,
  type DesignSystem,
  type Snapshot,
  type SystemPatch,
  type Mode,
} from "../../shared/model";
import {
  filterThemes,
  libraryThemes,
  prepareThemeApplication,
  themeCatalog,
  type LibraryTheme,
} from "../../shared/themes";
import { Dialog } from "./ui";

function ThemeSpecimen({ snapshot, mode }: { snapshot: Snapshot; mode: Mode }) {
  const [message, setMessage] = useState("");
  const colors = snapshot[mode];
  const style = {
    ...Object.fromEntries(
      tokenNames.map((key) => [`--tl-${key}`, colors[key]]),
    ),
    "--tl-radius": `${snapshot.settings.radius}px`,
    fontFamily:
      snapshot.settings.font === "Inter"
        ? "Inter Variable, sans-serif"
        : snapshot.settings.font,
  } as CSSProperties;
  return (
    <div className="theme-specimen" style={style} data-mode={mode}>
      <div className="theme-demo-bar">
        <span>
          <Layers /> Workspace
        </span>
        <small>PREVIEW</small>
        <span className="theme-demo-avatar">TS</span>
      </div>
      <div className="theme-demo-content">
        <p className="theme-demo-eyebrow">MỘT HỆ THỐNG, NHIỀU KHẢ NĂNG</p>
        <h3>
          Ý tưởng lớn.
          <br />
          Phong cách của bạn.
        </h3>
        <p>Màu sắc đồng bộ, từ những chi tiết nhỏ nhất.</p>
        <div className="theme-demo-actions">
          <button
            type="button"
            onClick={() => setMessage("Bạn vừa thử nút chính trong theme.")}
          >
            Bắt đầu dự án <ArrowRight />
          </button>
          <button
            type="button"
            onClick={() => setMessage("Bạn vừa thử nút phụ trong theme.")}
          >
            Khám phá
          </button>
        </div>
        <div className="theme-demo-grid">
          <div className="theme-demo-card">
            <span>
              Tổng quan dự án <i>+12%</i>
            </span>
            <strong>
              12,480<small> lượt tương tác</small>
            </strong>
            <svg
              viewBox="0 0 300 78"
              role="img"
              aria-label="Biểu đồ minh họa màu theme"
            >
              <path
                d="M0 65L40 48L80 54L120 23L160 35L200 16L240 30L300 5"
                fill="none"
                stroke="var(--tl-chart-1)"
                strokeWidth="3"
              />
              <path
                d="M0 72L40 62L80 67L120 49L160 55L200 39L240 48L300 29"
                fill="none"
                stroke="var(--tl-chart-2)"
                strokeWidth="2"
                opacity=".65"
              />
            </svg>
            <small>Dữ liệu minh họa để so sánh theme</small>
          </div>
          <div className="theme-demo-card theme-demo-form">
            <span>Tạo không gian mới</span>
            <label htmlFor={`theme-demo-name-${mode}`}>Tên dự án</label>
            <input id={`theme-demo-name-${mode}`} placeholder="Dự án của bạn" />
            <div>
              <span>Đang hoạt động</span>
              <span>Bản nháp</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setMessage("Đây là bản xem trước; chưa tạo dự án thật.")
              }
            >
              Tiếp tục <ChevronRight />
            </button>
          </div>
        </div>
        <div className="theme-demo-notice">
          <Check />
          <span>Mọi thành phần cùng sử dụng bộ token.</span>
        </div>
        <p className="theme-demo-feedback" role="status">
          {message || "Chọn thử theme không làm thay đổi dữ liệu."}
        </p>
      </div>
    </div>
  );
}

export interface ThemeLibraryProps {
  system: DesignSystem;
  systems: DesignSystem[];
  initialCreate?: boolean;
  onApply: (patch: SystemPatch) => Promise<boolean>;
  onCreate: (snapshot: Snapshot) => Promise<boolean>;
  onDone?: () => void;
}
export function ThemeLibrary({
  system,
  systems,
  initialCreate = false,
  onApply,
  onCreate,
  onDone,
}: ThemeLibraryProps) {
  const themes = useMemo(() => libraryThemes(systems), [systems]);
  const [selectedId, setSelectedId] = useState(
    initialCreate ? themeCatalog[0].id : `local:${system.id}`,
  );
  const [query, setQuery] = useState(""),
    [source, setSource] = useState("all");
  const [mode, setMode] = useState<Mode>("light");
  const [intent, setIntent] = useState<"apply" | "create">(
    initialCreate ? "create" : "apply",
  );
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const selected = themes.find((theme) => theme.id === selectedId) ?? themes[0];
  const filtered = filterThemes(themes, query, source);
  const application = prepareThemeApplication(system, selected.snapshot);
  const preview = intent === "apply" ? application.preview : selected.snapshot;
  const contrast = contrastReport(preview, mode);
  const failing = contrast.filter((pair) => !pair.aa).length;
  const choose = (theme: LibraryTheme) => {
    setSelectedId(theme.id);
    setError("");
    setSuccess("");
  };
  return (
    <div className="theme-library">
      <div className="theme-library-intro">
        <div>
          <span className="theme-library-kicker">THEME COLLECTION</span>
          <h2>
            Chọn một phong cách.
            <br />
            Tạo nên dấu ấn riêng.
          </h2>
          <p>
            {themeCatalog.length} theme có sẵn · {systems.length} hệ thống của
            bạn · chạy hoàn toàn local
          </p>
        </div>
        <div className="theme-library-orbit" aria-hidden="true">
          {["#18794E", "#C67C5D", "#7C3AED", "#E9BC6D", "#25374C"].map(
            (color) => (
              <i key={color} style={{ background: color }} />
            ),
          )}
        </div>
      </div>
      <div className="theme-library-layout">
        <section className="theme-browser" aria-label="Danh sách theme">
          <label className="theme-search">
            <Search />
            <input
              aria-label="Tìm theme"
              placeholder="Tìm tên hoặc nguồn theme…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="theme-source-filters" aria-label="Nguồn theme">
            {[
              ["all", "Tất cả"],
              ["tweakcn", "tweakcn"],
              ["Token Studio", "Studio"],
              ["Của bạn", "Của bạn"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                aria-pressed={source === value}
                onClick={() => setSource(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="theme-result-count">
            <span>{filtered.length} lựa chọn</span>
            <small>Chọn để xem trước</small>
          </div>
          <div className="theme-options">
            {filtered.map((theme) => (
              <button
                type="button"
                key={theme.id}
                className={`theme-option ${selected.id === theme.id ? "selected" : ""}`}
                aria-pressed={selected.id === theme.id}
                aria-label={`Chọn theme ${theme.name} · ${theme.source}`}
                onClick={() => choose(theme)}
              >
                <div className="theme-option-colors" aria-hidden="true">
                  {[
                    "primary",
                    "background",
                    "secondary",
                    "accent",
                    "foreground",
                  ].map((key) => (
                    <i
                      key={key}
                      style={{
                        background: theme.snapshot[mode][key as "primary"],
                      }}
                    />
                  ))}
                </div>
                <span>
                  <strong>{theme.name}</strong>
                  <small>{theme.source}</small>
                </span>
                {selected.id === theme.id && <Check />}
              </button>
            ))}
            {!filtered.length && (
              <div className="theme-empty">
                <Search />
                <strong>Chưa tìm thấy theme</strong>
                <p>Thử tên khác hoặc bỏ bộ lọc.</p>
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    setQuery("");
                    setSource("all");
                  }}
                >
                  Xóa tìm kiếm
                </button>
              </div>
            )}
          </div>
          <p className="theme-catalog-credit">
            42 palette phỏng theo tweakcn · Apache-2.0.
            <br />
            <a
              href="https://github.com/jnsahaj/tweakcn"
              target="_blank"
              rel="noreferrer"
            >
              Xem nguồn theme <ArrowRight />
            </a>
          </p>
        </section>
        <section className="theme-detail" aria-label="Xem trước theme">
          <div className="theme-detail-heading">
            <div>
              <span>{selected.source}</span>
              <h3>{selected.name}</h3>
            </div>
            <div className="segmented">
              <button
                type="button"
                className={mode === "light" ? "active" : ""}
                aria-label="Xem theme sáng"
                aria-pressed={mode === "light"}
                onClick={() => setMode("light")}
              >
                <Sun /> Sáng
              </button>
              <button
                type="button"
                className={mode === "dark" ? "active" : ""}
                aria-label="Xem theme tối"
                aria-pressed={mode === "dark"}
                onClick={() => setMode("dark")}
              >
                <Moon /> Tối
              </button>
            </div>
          </div>
          <ThemeSpecimen snapshot={preview} mode={mode} />
          <div className="theme-detail-meta">
            <span>{tokenNames.length} màu / chế độ</span>
            <span>
              {preview.settings.font} · {preview.settings.radius}px
            </span>
            <span className={failing ? "warning-text" : "green-text"}>
              {failing
                ? `${failing}/7 cặp cần kiểm tra AA`
                : "7/7 cặp chuẩn đạt AA"}
            </span>
          </div>
          <div className="theme-save-panel">
            <div
              className="theme-intent-tabs"
              role="group"
              aria-label="Cách sử dụng theme"
            >
              <button
                type="button"
                className={intent === "apply" ? "active" : ""}
                aria-pressed={intent === "apply"}
                onClick={() => {
                  setIntent("apply");
                  setSuccess("");
                }}
              >
                <Palette /> Áp dụng hiện tại
              </button>
              <button
                type="button"
                className={intent === "create" ? "active" : ""}
                aria-pressed={intent === "create"}
                onClick={() => {
                  setIntent("create");
                  setSuccess("");
                }}
              >
                <Plus /> Tạo hệ thống mới
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setSuccess("");
                setPending(true);
                try {
                  const ok =
                    intent === "apply"
                      ? await onApply(application.patch)
                      : await onCreate({
                          ...structuredClone(selected.snapshot),
                          name: name.trim(),
                        });
                  if (ok) {
                    setSuccess(
                      intent === "apply"
                        ? `Đã áp dụng ${selected.name}; có thể hoàn tác trong editor.`
                        : `Đã tạo ${name.trim()}.`,
                    );
                    onDone?.();
                  } else
                    setError(
                      "Chưa lưu được. Kiểm tra thông báo kết nối hoặc xung đột, rồi thử lại.",
                    );
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "Chưa lưu được theme.",
                  );
                } finally {
                  setPending(false);
                }
              }}
            >
              {intent === "create" ? (
                <label className="theme-new-name">
                  Tên design system
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={`Ví dụ: ${selected.name} của tôi`}
                    maxLength={60}
                    required
                  />
                </label>
              ) : (
                <p className="theme-target">
                  Hệ thống đích: <strong>{system.name}</strong>. Tên và lịch sử
                  được giữ nguyên.
                </p>
              )}
              {intent === "apply" && application.kept.length > 0 && (
                <details className="theme-lock-notice">
                  <summary>
                    <LockKeyhole />
                    Giữ nguyên {application.kept.length} thuộc tính đã khóa
                    trong cả bản xem trước và khi áp dụng.
                  </summary>
                  <p>{application.kept.join(", ")}</p>
                </details>
              )}
              <div className="theme-save-actions">
                <span>
                  {intent === "apply"
                    ? `${application.changed} giá trị sẽ thay đổi`
                    : "Một bản sao mới, lưu trên máy"}
                </span>
                <button
                  type="submit"
                  className="button dark"
                  disabled={
                    pending ||
                    (intent === "create"
                      ? !name.trim()
                      : application.changed === 0)
                  }
                >
                  {pending
                    ? "Đang lưu…"
                    : intent === "apply"
                      ? "Áp dụng theme"
                      : "Tạo design system"}
                  <ArrowRight />
                </button>
              </div>
            </form>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="theme-save-success" role="status">
                <Check />
                {success}
              </p>
            )}
          </div>
          <details className="theme-adaptation">
            <summary>Nguồn & thuộc tính tương thích</summary>
            <p>
              Bản local gồm bộ màu sáng/tối và thiết lập editor hỗ trợ. Không
              phải bản sao đầy đủ của giao diện tweakcn.
            </p>
            <ul>
              {selected.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </details>
        </section>
      </div>
    </div>
  );
}
export function ThemeLibraryDialog({
  onClose,
  ...props
}: ThemeLibraryProps & { onClose: () => void }) {
  return (
    <Dialog
      title={
        props.initialCreate ? "Tạo design system từ theme" : "Thư viện theme"
      }
      wide
      className="theme-library-dialog"
      onClose={onClose}
    >
      <ThemeLibrary {...props} onDone={onClose} />
    </Dialog>
  );
}
