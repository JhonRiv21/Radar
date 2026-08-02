"use client";

import { useI18n } from "@/lib/components/i18n";

export function BrandTagline() {
  const { t } = useI18n();
  return (
    <span className="hidden text-xs text-muted sm:inline">
      {t("brand.tagline")}
    </span>
  );
}

export function CreditLabel() {
  const { t } = useI18n();
  return <>{t("brand.credit")}</>;
}
