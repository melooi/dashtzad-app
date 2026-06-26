// Profile completion %, shared by the customer profile section and admin 360.
type CompletionUser = {
  name: string | null;
  email: string | null;
  nationalId: string | null;
  birthDate: Date | null;
};

/** 5 weighted factors → 0..100. hasAddress counts as one factor. */
export function computeProfileCompletion(user: CompletionUser, hasAddress: boolean): number {
  const factors = [
    !!user.name?.trim(),
    !!user.email?.trim(),
    !!user.nationalId?.trim(),
    !!user.birthDate,
    hasAddress,
  ];
  const filled = factors.filter(Boolean).length;
  return Math.round((filled / factors.length) * 100);
}
