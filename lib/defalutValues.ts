const isBrowser = typeof window !== "undefined"

const defaults = {
  commercial_register_fees: 1775,
  qiwa: 1075,
  muqeem: 1265,
}

export const getPrice = (key: keyof typeof defaults): number => {
  if (!isBrowser) return defaults[key]

  const saved = localStorage.getItem(key)
  // تحويل النص المسترجع إلى رقم، وإذا لم يوجد نستخدم القيمة الافتراضية
  return saved !== null ? Number(saved) : defaults[key]
}

export const setPrice = (key: keyof typeof defaults, value: number) => {
  if (isBrowser) {
    // localStorage تقبل نصوصاً فقط، لذا نحول الرقم إلى نص
    localStorage.setItem(key, value.toString())
  }
}
