import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  iconBg: string; // Tailwind bg color class
}

export function StatCard({ title, value, subtitle, icon, iconBg }: StatCardProps) {
  return (
    <div className="bg-neutral-900 p-4 rounded-lg shadow flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <h3 className="text-xs uppercase tracking-wide text-neutral-400">
          {title}
        </h3>
        <div
          className={`w-7 h-7 flex items-center justify-center rounded ${iconBg}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-neutral-400">{subtitle}</p>
      </div>
    </div>
  );
}
