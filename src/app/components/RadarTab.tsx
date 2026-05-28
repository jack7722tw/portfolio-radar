'use client';

import { Badge } from '@/components/ui/badge';

const THEMES = [
  {
    name: '電力基建',
    icon: '⚡',
    color: '#fbbf24',
    stocks: ['GEV', 'EOSE', 'PWR', 'ETN'],
    description: 'AI 數據中心需要大量電力，電網升級是基礎建設必需',
  },
  {
    name: '核能復興',
    icon: '☢️',
    color: '#00d4aa',
    stocks: ['CEG', 'VST', 'NNE', 'SMR'],
    description: '核能是 AI 算力的穩定能源來源，政策風向轉為支持',
  },
  {
    name: '散熱技術',
    icon: '❄️',
    color: '#38bdf8',
    stocks: ['VRT', 'CARR', 'JCI'],
    description: 'GPU 算力密度提升帶動散熱需求，液冷技術是下一代標準',
  },
  {
    name: '太空經濟',
    icon: '🚀',
    color: '#a78bfa',
    stocks: ['RKLB', 'ASTS', 'LUNR', 'PL'],
    description: 'SpaceX IPO 催化太空題材，衛星通訊和太空探索進入商業化',
  },
  {
    name: '電網儲能',
    icon: '🔋',
    color: '#f472b6',
    stocks: ['FSLR', 'ENPH', 'STEM', 'BWXT'],
    description: '再生能源搭配儲能系統，電網現代化的核心環節',
  },
];

export default function RadarTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">下一波雷達</h2>
      <p className="text-sm text-muted-foreground">追蹤五大投資主題，尋找下一波機會</p>

      <div className="grid gap-4">
        {THEMES.map(theme => (
          <div key={theme.name} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{theme.icon}</span>
              <h3 className="font-medium" style={{ color: theme.color }}>{theme.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{theme.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {theme.stocks.map(symbol => (
                <Badge key={symbol} variant="outline" className="font-mono text-xs">
                  {symbol}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
