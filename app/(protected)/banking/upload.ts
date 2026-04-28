import { supabase } from "@/lib/supabase/supabaseSsrClient"
import { BankTransaction } from "@/hooks/useBankBalance"

export async function addBankTransaction(data: BankTransaction) {
  const { data: insertedData, error } = await supabase
    .from("bank_balance")
    .insert({
      operation_date: data.operation_date,
      operation: data.operation,
      description: data.description,
      debit: data.debit,
      credit: data.credit,
    })
    .select()
    .single()

  if (error) throw error
  return insertedData
}

export async function deleteBankTransaction(id: string) {
  const { error } = await supabase.from("bank_balance").delete().eq("id", id)

  if (error) throw error
}
