import { createClient } from "@/lib/supabase/server";
import { Card, Field, PageHeader, SubmitButton } from "@/components/ui";

import { saveSettings } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    <div className="max-w-lg">
      <PageHeader title="Cài đặt giá" />
      <Card>
        <form action={saveSettings} className="space-y-4">
          <Field
            label="Giá điện (đ/kWh)"
            name="electricity_price"
            type="number"
            defaultValue={settings?.electricity_price ?? 0}
          />
          <Field
            label="Giá nước (đ/m³)"
            name="water_price"
            type="number"
            defaultValue={settings?.water_price ?? 0}
          />
          <Field
            label="Phí quản lý (đ/tháng)"
            name="management_fee"
            type="number"
            defaultValue={settings?.management_fee ?? 0}
          />
          <SubmitButton>Lưu</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
