
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardCardItem } from "@/types";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function StatCard({ title, value, icon: Icon, trend, actionLabel, actionHref }: DashboardCardItem) {
  const isPositiveTrend = trend && trend.startsWith('+');
  const isNegativeTrend = trend && trend.startsWith('-');

  return (
    <Card className="card-interactive hover:shadow-lg hover:-translate-y-1 transform">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs flex items-center ${isPositiveTrend ? 'text-green-600' : isNegativeTrend ? 'text-red-600' : 'text-muted-foreground'}`}>
            {isPositiveTrend && <ArrowUpRight className="h-4 w-4 mr-1" />}
            {isNegativeTrend && <ArrowDownRight className="h-4 w-4 mr-1" />}
            {trend}
          </p>
        )}
        {actionLabel && actionHref && (
          <Button variant="link" asChild className="px-0 pt-2 h-auto text-sm hover:text-primary/80">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
