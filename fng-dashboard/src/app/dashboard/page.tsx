import { fetchFngByPeriod, fetchFngStats } from "@/lib/api";
import DashboardClient from "@/components/DashboardClient";

export const revalidate = 3600;

export default async function Dashboard() {
  const [stats, data30d, data1y, data2y] = await Promise.all([
    fetchFngStats(),
    fetchFngByPeriod("30d"),
    fetchFngByPeriod("1y"),
    fetchFngByPeriod("2y"),
  ]);

  const { current, change, yearHigh, yearLow } = stats;

  return (
    <DashboardClient
      current={current}
      change={change}
      yearHigh={yearHigh}
      yearLow={yearLow}
      data30d={data30d}
      data1y={data1y}
      data2y={data2y}
    />
  );
}
