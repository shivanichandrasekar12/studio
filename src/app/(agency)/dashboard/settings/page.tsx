
import { PageHeader } from "@/components/page-header";

export default function AgencySettingsPage() {
  return (
    <>
      <PageHeader
        title="Agency Settings"
        description="Manage your agency and application settings."
      />
      <div className="p-6 bg-card rounded-lg shadow">
        <p className="text-muted-foreground">
          This is a placeholder for the agency settings page. Future settings options will appear here.
        </p>
      </div>
    </>
  );
}
