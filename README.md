# Port Manager

Xem các port đang được lắng nghe trên máy của bạn và kill process chiếm port ngay trên giao diện web.

Ứng dụng chạy **trên chính máy bạn** (server local), nên có thể đọc và kill process của máy đó.

## Yêu cầu

- Node.js 20+
- macOS hoặc Linux, vì ứng dụng dùng `lsof` để liệt kê port. Windows chưa được hỗ trợ.

## Chạy nhanh bằng một lệnh

```bash
npx github:bvminh-dev/my-port
```

Lệnh trên sẽ tự động:

1. Tải repo, cài dependencies và build (lần đầu mất khoảng 1–2 phút).
2. Chạy server tại `http://127.0.0.1:3300`. Nếu port 3300 đang bị chiếm, server tự tăng lên port trống kế tiếp.
3. Mở trình duyệt vào ứng dụng.

Nhấn `Ctrl+C` trong terminal để tắt.

### Tuỳ chọn

| Cách dùng | Ý nghĩa |
| --- | --- |
| `PORT=4000 npx github:bvminh-dev/my-port` | Bắt đầu tìm port trống từ 4000 |
| `npx --yes github:bvminh-dev/my-port` | Bỏ qua hỏi xác nhận cài đặt |
| `npx github:bvminh-dev/my-port#v0.1.0` | Chạy đúng một tag/branch/commit |

> **Cập nhật:** npx cache theo ref, nên lần sau có thể vẫn chạy bản cũ. Muốn lấy bản mới, ghim tag/commit mới,
> hoặc xoá cache bằng `rm -rf ~/.npm/_npx`.

## Bảo mật

Server chỉ bind `127.0.0.1`, nên chỉ máy bạn truy cập được. **Đừng** đổi sang `0.0.0.0` hay expose ra mạng, vì bất kỳ ai
truy cập được cũng kill được process trên máy bạn.

## Phát triển

```bash
npm install     # tự chạy next build qua script `prepare`
npm run dev     # http://localhost:3300
npm run build
npm start       # production, port 3300
npm run lint
```

Chạy thử CLI từ source: `node bin/cli.mjs` (cần `npm run build` trước).

## Cấu trúc

```
app/              Next.js App Router (page, server actions)
domain/           Entity, value object, repository interface
application/      Service và DTO
infrastructure/   Adapter hệ thống (LsofPortRepository)
presentation/     Component UI
bin/cli.mjs       Entry của `npx`: start server + mở browser
```
