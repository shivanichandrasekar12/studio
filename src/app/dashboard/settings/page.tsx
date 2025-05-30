
import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your agency and application settings."
      />
      <div className="p-6 bg-card rounded-lg shadow">
        <p className="text-muted-foreground">
          This is a placeholder for the settings page. Future settings options will appear here.
        </p>
      </div>
    </>
  );
}
