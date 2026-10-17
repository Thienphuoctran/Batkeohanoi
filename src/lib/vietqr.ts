export interface VietQRParams {
  bankCode: string; // 'MB', 'VCB', 'TCB', 'BIDV', etc.
  accountNo: string;
  amount: number;
  memo: string;
  template?: "compact" | "compact2" | "qr_only";
}

export function generateVietQRUrl({
  bankCode,
  accountNo,
  amount,
  memo,
  template = "compact2",
}: VietQRParams): string {
  const encodedMemo = encodeURIComponent(memo.trim());
  return `https://img.vietqr.io/image/${bankCode}-${accountNo}-${template}.png?amount=${Math.round(
    amount
  )}&addInfo=${encodedMemo}`;
}

// Hàm tiện ích sinh mã cho Ban Quản Trị (Ký quỹ 200k)
export function getAdminEscrowQRUrl(
  matchId: string,
  teamName: string
): string {
  const memo = `BATKEO7 COC ${matchId.slice(0, 8)} ${teamName.slice(0, 10)}`;
  return generateVietQRUrl({
    bankCode: process.env.NEXT_PUBLIC_ADMIN_BANK_CODE || "MB",
    accountNo: process.env.NEXT_PUBLIC_ADMIN_ACCOUNT_NO || "07440948327598",
    amount: Number(process.env.NEXT_PUBLIC_FIXED_DEPOSIT_AMOUNT) || 200000,
    memo: memo,
  });
}
