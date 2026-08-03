"use client";

import { useI18n } from "@/lib/components/i18n";

export function DbError() {
  const { t } = useI18n();

  return (
    <div className="glass rounded-lg p-6">
      <p className="font-medium text-red-300">{t("error.title")}</p>
      <p className="mt-2 text-sm text-muted">{t("error.help")}</p>
    </div>
  );
}
