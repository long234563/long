# Neon Dodge — game Android offline

Kéo tàu sang trái/phải để né thiên thạch. Độ khó tăng theo thời gian, có điểm cao lưu trên máy, tạm dừng và chơi lại. Không quảng cáo, không đăng nhập, không yêu cầu quyền Internet.

## Tạo APK qua GitHub

1. Tạo repository mới tên `neon-dodge` tại https://github.com/new. Có thể chọn Private. **Tích Add a README file** để repo có commit đầu tiên.
2. Gửi link repo cho trợ lý để đưa bộ mã nguồn này lên. Hoặc tự upload **toàn bộ nội dung bên trong thư mục NeonDodge**, gồm `.github/workflows/build-apk.yml`, `app/`, `tests/`, các file Gradle. Không đặt thêm một lớp thư mục NeonDodge trong repo.
3. Mở tab **Actions → Build Android APK**. Workflow tự chạy khi push. Nếu chưa chạy, chọn **Run workflow**.
4. Chờ build có dấu ✓ xanh. Mở run → phần **Artifacts → NeonDodge-APK**.
5. Tải ZIP artifact về, giải nén, lấy **NeonDodge-debug.apk** và chuyển sang điện thoại Android.
6. Mở APK trên điện thoại, cho phép ứng dụng đang mở file cài đặt từ nguồn này khi Android yêu cầu, rồi cài.

Nếu Actions bị tắt trong repo, bật ở tab Actions rồi chạy lại. Artifact được giữ 30 ngày; có thể build lại để tạo bản tải mới.

## Điều khiển

- Chạm và kéo trên vùng chơi để điều khiển tàu.
- Nút Ⅱ: tạm dừng; nhấn Tiếp tục để chơi tiếp.
- Khi chuyển ứng dụng, game tự tạm dừng.
- Nút Back khi đang chơi: tạm dừng. Nút Back ở menu: thoát ứng dụng.
- Bản chạy bằng trình duyệt hỗ trợ phím mũi tên hoặc A/D; Escape tạm dừng.
- Điểm: 10 điểm mỗi giây sống sót, thêm 25 điểm cho mỗi thiên thạch vượt khỏi màn hình.

## Build và thử trên máy tính

Yêu cầu Android SDK 35, Build Tools 35.0.0, JDK 17 và Gradle 8.9. GitHub Actions cài các công cụ này tự động.

```sh
node tests/engine.test.cjs
gradle --no-daemon :app:assembleDebug :app:lintDebug
```

APK: `app/build/outputs/apk/debug/app-debug.apk`.

Dự án không kèm Gradle Wrapper JAR: workflow cài trực tiếp Gradle 8.9 bằng `setup-gradle`. Khi cần wrapper cho máy cá nhân, dùng Gradle 8.9 chạy `gradle wrapper --gradle-version 8.9`, rồi dùng `./gradlew` (Windows: `gradlew.bat`).

Thử giao diện trình duyệt:

```sh
python3 -m http.server 8000 --directory app/src/main/assets
```

Mở http://localhost:8000. Bản APK dùng cùng giao diện và logic trong Android WebView, toàn bộ tài nguyên được đóng gói trong app.

## Trạng thái kiểm tra

- Đã chạy kiểm tra logic bằng Node: giới hạn di chuyển, tạo chướng ngại vật, điểm, pause/resume, reset, va chạm khi vật thể di chuyển nhanh, dọn vật thể ngoài màn hình.
- Đã kiểm tra cú pháp JavaScript và XML.
- Chưa biên dịch APK, chạy Android lint hoặc thử trên điện thoại tại thời điểm đóng gói. Kết quả build thật sẽ có trong GitHub Actions sau khi đưa mã nguồn lên repo.
- APK được cấu hình là **debug**, có chữ ký debug tự động để cài thử. Chưa có khóa ký release để phát hành Google Play. Các lần build trên runner khác nhau có thể dùng khóa debug khác nhau; nếu Android báo xung đột chữ ký khi cập nhật, gỡ bản cũ trước khi cài bản mới (điểm cao sẽ mất).

## Các phần chính

| Tệp | Vai trò |
| --- | --- |
| `.github/workflows/build-apk.yml` | Kiểm tra logic, build, lint và cung cấp APK để tải |
| `app/src/main/java/com/luclab/neondodge/MainActivity.java` | Ứng dụng Android chứa game offline |
| `app/src/main/assets/index.html` | Giao diện game |
| `app/src/main/assets/engine.js` | Di chuyển, va chạm, điểm và độ khó |
| `app/src/main/assets/game.js` | Hiển thị, input, menu và lưu điểm cao |
| `tests/engine.test.cjs` | Kiểm tra logic độc lập |

Thông số build đối chiếu với tài liệu chính thức:
- https://developer.android.com/build/releases/agp-8-7-0-release-notes
- https://github.com/gradle/actions
- https://github.com/android-actions/setup-android
