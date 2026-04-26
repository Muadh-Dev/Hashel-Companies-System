// app/(auth)/login/error/page.tsx
export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center" dir="rtl">
      <p className="text-xl text-red-600">
        عذراً، حدث خطأ غير متوقع. إذا استمر الخطأ بالظهور يرجى التواصل مع المطور
      </p>
    </div>
  )
}
