# Dola

Sổ doanh thu và chi phí theo từng project cho startup web: quảng cáo, server, tài nguyên và hoá đơn. Nhập bằng form hoặc một câu tiếng Việt, rồi nhờ Mistral đánh giá lời lỗ.

Dữ liệu nằm trên Firestore của project `dola-ai-ledger` (tài khoản `nguyenhieuutck57@gmail.com`). Ứng dụng chạy trên Vercel. Firebase Authentication của project mới yêu cầu gói Blaze, nên đăng nhập dùng phiên riêng trên server và Firestore chỉ được ghi qua service account.

## Chạy local

```bash
npm install
npm run dev
```

Tạo `.env.local` từ `.env.example`. Không commit file này.

## Kiểm tra

```bash
npm run lint
npm run typecheck
npm run build
```
