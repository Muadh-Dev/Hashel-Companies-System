import withPWAInit from "@ducanh2912/next-pwa"

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // إيقاف الـ PWA في بيئة التطوير لتسهيل العمل
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // إعدادات Next.js الخاصة بك هنا
}

export default withPWA(nextConfig)
