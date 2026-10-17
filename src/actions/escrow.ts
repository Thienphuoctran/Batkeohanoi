"use server";

import { getAdminClient } from "@/lib/supabase";
import { sendTelegramAlert } from "./telegram";
import { revalidatePath } from "next/cache";

const ADMIN_BANK_ACCOUNT = "07440948327598";
const ADMIN_BANK_NAME = "MB Bank";
const ADMIN_NAME = "TRAN QUOC THIEN PHUOC";
const REQUIRED_DEPOSIT = 200000;

export async function createEscrowDepositRequest(
  matchId: string,
  teamId: string
) {
  const supabase = getAdminClient();

  const transferMemo = `BK7 COC ${matchId.slice(0, 6)} ${teamId.slice(
    0,
    4
  )}`.toUpperCase();

  const { data, error } = await supabase
    .from("escrow_deposits")
    .insert({
      match_id: matchId,
      team_id: teamId,
      amount: REQUIRED_DEPOSIT,
      bank_account_no: ADMIN_BANK_ACCOUNT,
      bank_name: ADMIN_BANK_NAME,
      account_holder: ADMIN_NAME,
      transfer_memo: transferMemo,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      message: "Lỗi tạo yêu cầu ký quỹ: " + error.message,
    };
  }

  return {
    success: true,
    depositId: data?.id,
    depositInfo: {
      accountNo: ADMIN_BANK_ACCOUNT,
      accountHolder: ADMIN_NAME,
      bank: ADMIN_BANK_NAME,
      amount: REQUIRED_DEPOSIT,
      memo: transferMemo,
      vietQrUrl: `https://img.vietqr.io/image/MB-${ADMIN_BANK_ACCOUNT}-compact2.png?amount=${REQUIRED_DEPOSIT}&addInfo=${encodeURIComponent(
        transferMemo
      )}`,
    },
  };
}

// BQT hoặc Webhook đối soát ngân hàng gọi hàm này để phê duyệt cọc
export async function verifyEscrowDeposit(depositId: string) {
  const supabase = getAdminClient();

  const { data: escrow, error } = await supabase
    .from("escrow_deposits")
    .update({ status: "verified", verified_at: new Date().toISOString() })
    .eq("id", depositId)
    .select("*, teams(team_name), matches(pitch_custom_name)")
    .single();

  if (error || !escrow) {
    return { success: false, message: "Không thể xác thực giao dịch cọc." };
  }

  const rawEscrow = escrow as any;
  const teamName = rawEscrow?.teams?.team_name || "Đội bóng";
  const pitchName = rawEscrow?.matches?.pitch_custom_name || "Sân cỏ nhân tạo";

  // Bắn thông báo Telegram xác nhận tiền về
  await sendTelegramAlert(
    `💰 <b>XÁC NHẬN KÝ QUỸ THÀNH CÔNG!</b>\n` +
      `• Đội: <b>${teamName}</b>\n` +
      `• Số tiền: <b>200.000 VNĐ</b> (MB Bank - TRAN QUOC THIEN PHUOC)\n` +
      `• Trận: ${pitchName}\n` +
      `👉 Kèo đã được mở khóa bắt đối an toàn!`
  );

  revalidatePath("/");
  return { success: true, message: "Đã xác nhận tiền cọc thành công." };
}
