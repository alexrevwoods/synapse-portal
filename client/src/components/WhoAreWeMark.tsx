import { WHOAREWE_ASSETS, WHOAREWE_BRAND } from "@shared/brand";
import { cn } from "@/lib/utils";

type WhoAreWeMarkProps = {
  className?: string;
  /** Show the complete official wordmark. False shows the official icon only. */
  label?: boolean;
  /** Use the official logo-plus-tagline lockup where ample space is available. */
  tagline?: boolean;
};

export default function WhoAreWeMark({ className, label = true, tagline = false }: WhoAreWeMarkProps) {
  const source = tagline ? WHOAREWE_ASSETS.logoTaglineDark : label ? WHOAREWE_ASSETS.primaryLogoDark : WHOAREWE_ASSETS.iconSvg;
  const alt = tagline ? `${WHOAREWE_BRAND.name} — ${WHOAREWE_BRAND.tagline}` : WHOAREWE_BRAND.name;

  return (
    <span className={cn("whoarewe-mark", tagline && "whoarewe-mark--tagline", !label && "whoarewe-mark--icon", className)}>
      <img src={source} alt={alt} className="whoarewe-mark__asset" />
    </span>
  );
}
