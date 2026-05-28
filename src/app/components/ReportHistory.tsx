'use client';

import { useMemo } from 'react';
import type { WeeklyReport } from '@/lib/types';
import { getReports } from '@/lib/store';
import { formatPercent } from '@/lib/calculations';

export default function ReportHistory() {
  const reports = useMemo(() => getReports(), []);

  if (reports.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        尚無歷史週報
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map(report => (
        <ReportSummary key={report.id} report={report} />
      ))}
    </div>
  );
}

function ReportSummary({ report }: { report: WeeklyReport }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">第 {report.weekNumber} 週</span>
        <span className="text-xs text-muted-foreground">{report.date}</span>
      </div>
      <div className="flex gap-4 text-sm">
        <span className={report.portfolioReturn >= 0 ? 'text-[#00d4aa]' : 'text-[#ff4d6d]'}>
          組合 {formatPercent(report.portfolioReturn)}
        </span>
        <span className="text-muted-foreground">
          SPY {formatPercent(report.spyReturn)}
        </span>
      </div>
      {report.lastWeekAccuracy !== undefined && (
        <div className="text-xs text-muted-foreground">
          AI 準確度: {report.lastWeekAccuracy}%
        </div>
      )}
    </div>
  );
}
