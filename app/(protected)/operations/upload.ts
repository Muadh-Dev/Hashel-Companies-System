import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { Transaction } from "@/hooks/useTransactions"

export type TransactionInput = Omit<
  Transaction,
  "id" | "created_at" | "companies"
>

export async function addTransaction(
  data: TransactionInput
): Promise<Transaction> {
  // التحقق من صحة البيانات قبل الإرسال
  if (!data.resident_name?.trim()) {
    throw new Error("اسم المقيم مطلوب")
  }

  if (
    !data.iqama_number ||
    (!/^\d{10}$/.test(data.iqama_number) && data.iqama_number !== "")
  ) {
    throw new Error("رقم الإقامة يجب أن يكون 10 أرقام")
  }

  try {
    const { data: insertedData, error } = await supabase
      .from("transactions")
      .insert([
        {
          ...data,
          // التأكد من تحويل القيم الفارغة إلى null
          expiry_date: data.expiry_date || null,
          payment_date: data.payment_date || null,
          note: data.note || null,
        },
      ])
      .select("*, companies(establishment_number, social_insurance_number)")
      .single()

    if (error) throw error
    if (!insertedData) throw new Error("لم يتم إرجاع البيانات بعد الإضافة")

    return insertedData as Transaction
  } catch (error) {
    console.error("خطأ في إضافة المعاملة:", error)
    throw error
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  if (!id) throw new Error("معرف المعاملة مطلوب")

  try {
    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("خطأ في حذف المعاملة:", error)
    throw error
  }
}

export async function addPaymentToTransaction(
  id: string,
  newTotalReceived: number
): Promise<Transaction> {
  if (!id) throw new Error("معرف المعاملة مطلوب")

  try {
    const { data, error } = await supabase
      .from("transactions")
      .update({ received_amount: newTotalReceived })
      .eq("id", id)
      .select("*, companies(establishment_number, social_insurance_number)")
      .single()

    if (error) throw error
    if (!data) throw new Error("لم يتم العثور على المعاملة")

    return data as Transaction
  } catch (error) {
    console.error("خطأ في تحديث المبلغ المستلم:", error)
    throw error
  }
}

export async function updateTransaction(
  id: string,
  data: Partial<TransactionInput>
): Promise<Transaction> {
  if (!id) throw new Error("معرف المعاملة مطلوب")

  try {
    const { data: updatedData, error } = await supabase
      .from("transactions")
      .update(data)
      .eq("id", id)
      .select("*, companies(establishment_number, social_insurance_number)")
      .single()

    if (error) throw error
    if (!updatedData) throw new Error("لم يتم العثور على المعاملة")

    return updatedData as Transaction
  } catch (error) {
    console.error("خطأ في تحديث المعاملة:", error)
    throw error
  }
}
