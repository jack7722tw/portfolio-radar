'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Trade } from '@/lib/types';
import { getTrades, saveTrades } from '@/lib/store';
import { formatCurrency } from '@/lib/calculations';

const EMOTIONS = ['冷靜', '興奮', '恐懼', 'FOMO', '貪婪', '猶豫'];

export default function JournalTab() {
  const [trades, setTrades] = useState<Trade[]>(() => getTrades());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    symbol: '',
    action: 'BUY' as 'BUY' | 'SELL',
    shares: '',
    price: '',
    emotion: '',
    reason: '',
    note: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.symbol || !form.shares || !form.price) return;

    const newTrade: Trade = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      symbol: form.symbol.toUpperCase(),
      action: form.action,
      shares: parseFloat(form.shares),
      price: parseFloat(form.price),
      emotion: form.emotion,
      reason: form.reason,
      note: form.note || undefined,
    };

    const updated = [newTrade, ...trades];
    setTrades(updated);
    saveTrades(updated);
    setShowForm(false);
    setForm({ symbol: '', action: 'BUY', shares: '', price: '', emotion: '', reason: '', note: '' });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">交易日誌</h2>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          + 記錄交易
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">標的</Label>
              <Input value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} placeholder="NVDA" className="mt-1 font-mono uppercase" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">操作</Label>
              <div className="flex gap-2 mt-1">
                <Button type="button" size="sm" variant={form.action === 'BUY' ? 'default' : 'outline'} onClick={() => setForm({ ...form, action: 'BUY' })} className="flex-1">買入</Button>
                <Button type="button" size="sm" variant={form.action === 'SELL' ? 'default' : 'outline'} onClick={() => setForm({ ...form, action: 'SELL' })} className="flex-1">賣出</Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">股數</Label>
              <Input value={form.shares} onChange={e => setForm({ ...form, shares: e.target.value })} type="number" className="mt-1 font-mono" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">價格</Label>
              <Input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} type="number" step="0.01" className="mt-1 font-mono" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">當下情緒</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {EMOTIONS.map(em => (
                <Badge
                  key={em}
                  variant={form.emotion === em ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setForm({ ...form, emotion: em })}
                >
                  {em}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">交易理由</Label>
            <Textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="為什麼做這筆交易？" className="mt-1" rows={2} />
          </div>
          <Button type="submit" size="sm">記錄</Button>
        </form>
      )}

      <div className="space-y-2">
        {trades.map(trade => (
          <div key={trade.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={trade.action === 'BUY' ? 'default' : 'secondary'} className={trade.action === 'BUY' ? 'bg-[#00d4aa]/20 text-[#00d4aa]' : 'bg-[#ff4d6d]/20 text-[#ff4d6d]'}>
                {trade.action === 'BUY' ? '買入' : '賣出'}
              </Badge>
              <div>
                <span className="font-mono font-bold">{trade.symbol}</span>
                <span className="text-xs text-muted-foreground ml-2">{trade.date}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm">{trade.shares} 股 × {formatCurrency(trade.price)}</div>
              <div className="flex items-center gap-1.5 justify-end">
                {trade.emotion && <Badge variant="outline" className="text-xs">{trade.emotion}</Badge>}
              </div>
            </div>
          </div>
        ))}
        {trades.length === 0 && (
          <div className="text-center text-muted-foreground py-12">尚無交易記錄</div>
        )}
      </div>
    </div>
  );
}
