import { Briefcase } from "lucide-react";
import Link from "next/link";

export default function CustomerAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center text-2xl font-bold text-primary">
          <Briefcase className="mr-2 h-8 w-8" />
          NomadX <span className="text-sm ml-1 text-muted-foreground">(Customer Portal)</span>
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
