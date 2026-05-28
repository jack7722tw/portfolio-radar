'use client';

import { Badge } from '@/components/ui/badge';
import type { Alternative } from '@/lib/types';

interface Props {
  alternative: Alternative;
}

export default function AlternativeCard({ alternative }: Props) {
  const confidenceColor = {
    '高': 'bg-[#00d4aa]/20 text-[#00d4aa]',
    '中': 'bg-[#fbbf24]/20 text-[#fbbf24]',
    '低': 'bg-[#64748b]/20 text-[#64748b]',
  }[alternative.confidence];

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[#ff4d6d]">{alternative.replace}</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-mono text-[#00d4aa] font-bold">{alternative.suggestSymbol}</span>
        </div>
        <Badge className={`${confidenceColor} border-0 text-xs`}>
          {alternative.confidence}
        </Badge>
      </div>
      <div className="text-sm text-foreground">{alternative.suggestName}</div>
      <div className="text-xs text-muted-foreground">{alternative.replaceReason}</div>
      <div className="text-xs text-foreground">{alternative.suggestReason}</div>
      {alternative.catalyst && (
        <div className="text-xs text-[#fbbf24]">催化劑: {alternative.catalyst}</div>
      )}
      <div className="text-xs text-muted-foreground">
        建議持有: {alternative.expectedHoldingPeriod}
      </div>
    </div>
  );
}
