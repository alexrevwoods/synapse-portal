import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { applyPlatformSkin, getGuestSkin } from "@/lib/skins";

export default function PlatformSkinInitializer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const account = trpc.account.overview.useQuery(undefined, { enabled: isAuthenticated });
  useEffect(() => {
    if (account.data?.membership) {
      applyPlatformSkin(account.data.membership.platformSkin, { primary: account.data.membership.skinPrimary, secondary: account.data.membership.skinSecondary });
      return;
    }
    if (!isAuthenticated) applyPlatformSkin(getGuestSkin());
  }, [account.data, isAuthenticated]);
  return <>{children}</>;
}
