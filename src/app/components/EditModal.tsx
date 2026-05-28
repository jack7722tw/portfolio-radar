'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Position } from '@/lib/types';

interface Props {
  position: Position | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Position) => void;
}

export default function EditModal({ position, open, onClose, onSave }: Props) {
  const [shares, setShares] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (position) {
      setShares(String(position.shares));
      setCostBasis(String(position.costBasis));
      setStopLoss(position.stopLoss ? String(position.stopLoss) : '');
      setTakeProfit(position.takeProfit ? String(position.takeProfit) : '');
      setNote(position.note || '');
    }
  }, [position]);

  if (!position) return null;

  function handleSave() {
    if (!position) return;
    onSave({
      ...position,
      shares: parseFloat(shares) || position.shares,
      costBasis: parseFloat(costBasis) || position.costBasis,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      stopLossSource: stopLoss ? 'manual' : position.stopLossSource,
      takeProfitSource: takeProfit ? 'manual' : position.takeProfitSource,
      note: note || undefined,
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono">{position.symbol} 編輯</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">股數</Label>
              <Input value={shares} onChange={e => setShares(e.target.value)} type="number" className="mt-1 font-mono" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">成本價</Label>
              <Input value={costBasis} onChange={e => setCostBasis(e.target.value)} type="number" step="0.01" className="mt-1 font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">自訂止損</Label>
              <Input value={stopLoss} onChange={e => setStopLoss(e.target.value)} type="number" step="0.01" placeholder="AI 建議" className="mt-1 font-mono" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">自訂止盈</Label>
              <Input value={takeProfit} onChange={e => setTakeProfit(e.target.value)} type="number" step="0.01" placeholder="AI 建議" className="mt-1 font-mono" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">備註</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="個人筆記..." className="mt-1" rows={2} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={onClose}>取消</Button>
            <Button size="sm" onClick={handleSave}>儲存</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
