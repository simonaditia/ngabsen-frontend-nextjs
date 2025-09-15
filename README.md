# KairosHR Frontend

Aplikasi absensi karyawan WFH dengan dashboard admin monitoring, notifikasi real-time, dan proteksi keamanan berbasis Next.js + Firebase Cloud Messaging.

## Fitur Utama
- Login & autentikasi JWT (role-based: staff/admin)
- Dashboard karyawan: absen, summary, profile
- Dashboard admin: monitoring, notifikasi real-time, manajemen karyawan
- Notifikasi push via Firebase Cloud Messaging (FCM)
- Proteksi route & validasi input
- Export data ke CSV

## Teknologi
- Next.js (App Router, TypeScript)
- Tailwind CSS
- Axios
- Firebase Cloud Messaging

## Instalasi
1. Clone repo ini
2. Install dependency:
	```bash
	npm install
	```
3. Buat file `.env.local` di root, isi dengan credential Firebase:
	```env
	NEXT_PUBLIC_FIREBASE_API_KEY=...
	NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
	NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
	NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
	NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
	NEXT_PUBLIC_FIREBASE_APP_ID=...
	NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
	NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
	```
4. Jalankan aplikasi:
	```bash
	npm run dev
	```

## Konfigurasi FCM
- Pastikan file `public/firebase-messaging-sw.js` sudah terisi credential Firebase (public key).
- Notifikasi hanya berjalan jika browser mengizinkan notification.

## Struktur Folder
- `src/app/` : Halaman utama (dashboard, profile, admin, dll)
- `src/hooks/` : Custom hooks (auth, attendance, FCM)
- `src/firebase/` : Inisialisasi Firebase
- `public/` : Asset publik & service worker FCM

## Keamanan
- Semua credential diambil dari `.env.local`
- Proteksi route & role di semua halaman
- Token dikirim via Authorization Bearer
- Validasi input di frontend & backend

## API Endpoint
- Auth: `POST /auth/login`
- Profile: `GET/PATCH /employees/profile`
- Attendance: `POST /attendance/clock-in`, `GET /attendance/summary`
- Admin: `GET /admin/employees`, `GET /admin/notifications`, `POST /employees/device-token`

## Kontribusi
Pull request & issue dipersilakan!

## Lisensi
MIT
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
