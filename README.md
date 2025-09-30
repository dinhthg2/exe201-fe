# EXE201 Frontend

Next.js 14 + App Router + TailwindCSS.

## Scripts
- dev: run local dev server on port 3000
- build / start: production build

## Auth Flow
- AuthContext lưu token + user trong localStorage
- axios interceptor đính Authorization header và redirect 401 -> /login

## Pages
- / (home)
- /login
- /register
- /dashboard (role based panel)
- /dashboard/swipe (UI swipe bạn học) ✅

## Env
Tạo `.env.local`:
```
NEXT_PUBLIC_API_BASE=http://localhost:5000/api
```

## Swipe UI (ĐÃ TRIỂN KHAI)
- Trang: `/dashboard/swipe`
- API dùng:
  - GET `/swipes/candidates/filter` (query: subject, ageMin, ageMax, limit, role, exclude, minRating)
  - POST `/swipes` body: { target_id, direction }
  - POST `/swipes/undo` body: { swipeId }
  - GET `/swipes/matches?detailed=1&preview=1` (tùy chọn)
- Thành phần chính:
  - `components/swipe/SwipeDeck.tsx` quản lý candidate stack, lịch sử undo, preload thêm.
  - `components/swipe/SwipeCard.tsx` xử lý gesture (Pointer Events) + buttons fallback.
  - `components/swipe/SwipeFilterBar.tsx` + `components/ui/ComboBox.tsx` (combo filter hiện đại).
- Match Modal: Hiện khi backend trả về `match` (reciprocal right-right). Có nút chuyển nhanh sang chat (`/dashboard/chat`).
- Undo: Chỉ hoạt động nếu swipe chưa tạo match (phụ thuộc backend kiểm tra). UI thêm lại card vào đầu stack.
- Preload: Khi còn < 4 candidate sẽ gọi tiếp filter API để nạp thêm.
- Filter khởi tạo: `{ role: 'student', limit: 20 }` có thể mở rộng thành form filter sau.

### Combo Filter Hiện Đại
| Field | Mô tả | Mapping API |
|-------|------|-------------|
| Môn học | Combobox search + clear | subject (query) |
| Tuổi từ/đến | Numeric inputs | ageMin / ageMax |
| Role | Combobox (student / tutor) | role |
| Rating tối thiểu | Combobox rating ≥ x ★ | minRating |
| Reset | Nút reset tất cả | — |

- Combobox có keyboard: ArrowUp/Down, Enter, Escape, tìm kiếm theo label.
- Tự động reload danh sách khi state filter đổi (so sánh JSON).
- Hiển thị tổng số kết quả (badge bên cạnh tiêu đề).

## Cách thêm vào navigation
Thêm link tới `/dashboard/swipe` trong `SiteHeader` hoặc menu dashboard nếu cần.

## Mở rộng tương lai
- Thêm form filter bên cạnh (subject / age / rating).
- Animation nâng cao bằng Framer Motion (spring, stack depth scale).
- WebSocket realtime hiển thị match mới / online state.
- Daily quota + hiển thị số lượt còn lại.
- Loading skeleton card thay vì text.

## Next Steps
- Thêm bảo vệ route qua middleware Next
- UI hiển thị courses, enrollments
- (ĐÃ XONG) Swipe UI (WebSocket + drag/swipe cơ bản, chưa realtime)
- Tách layout theo role

## Dashboard Features (Updated)
### Connections
Hiển thị hai danh sách: Bạn học (classmates) và Tutors gợi ý. Gọi API:
- GET /students/:id/dashboard/connections (cần token)
- GET /students/dashboard/tutors (cần token)
Có loading/error/empty states + pastel UI.

### Match (Swipe)
Candidate list gọi endpoint filter chuyên biệt. Drag gesture Pointer Events:
- Kéo ngang > 120px quyết định Like (phải) hoặc Pass (trái)
- Buttons fallback.
POST /swipes -> nếu trả về `match` hiển thị modal.
GET /swipes/matches (tương lai dùng hiển thị danh sách match).

### Notes
- Drag gesture custom (không dùng lib) => dễ mở rộng haptic hoặc vibration.
- Modal đơn giản, có thể refactor thành headless component.
- Có debounce preload khi ít candidate.

### Tests (Backend)
Đã thêm các tests mẫu (Jest + supertest) cho:
- Swipe & Match flow: unauthorized, first swipe, reciprocal tạo match, duplicate.
- Connections & Tutors endpoints: authorized/unauthorized.
Tests không seed DB; cần mở rộng khi tích hợp dữ liệu thật.
