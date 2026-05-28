'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Position } from '@/lib/types';

interface Props {
  onAdd: (position: Position) => void;
  onClose: () => void;
}

export default function PositionInput({ onAdd, onClose }: Props) {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [costBasis, setCostBasis] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol || !shares || !costBasis) return;

    onAdd({
      symbol: symbol.toUpperCase().trim(),
      shares: parseFloat(shares),
      costBasis: parseFloat(costBasis),
      stopLossSource: 'ai',
      takeProfitSource: 'ai',
    });

    setSymbol('');
    setShares('');
    setCostBasis('');
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <h3 className="text-sm font-medium text-muted-foreground">新增持倉</h3>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="symbol" className="text-xs text-muted-foreground">標的代號</Label>
          <Input
            id="symbol"
            placeholder="NVDA"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            className="mt-1 font-mono uppercase"
          />
        </div>
        <div>
          <Label htmlFor="shares" className="text-xs text-muted-foreground">股數</Label>
          <Input
            id="shares"
            type="number"
            placeholder="10"
            value={shares}
            onChange={e => setShares(e.target.value)}
            className="mt-1 font-mono"
          />
        </div>
        <div>
          <Label htmlFor="cost" className="text-xs text-muted-foreground">成本價</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            placeholder="200.00"
            value={costBasis}
            onChange={e => setCostBasis(e.target.value)}
            className="mt-1 font-mono"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
          確認新增
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          取消
        </Button>
      </div>
    </form>
  );
}
