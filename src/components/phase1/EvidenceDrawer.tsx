import React from 'react';
import { X, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import type { RootCause } from './ChatFirstCopilot';

interface EvidenceDrawerProps {
  open: boolean;
  data: RootCause | null;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  open,
  data,
  onClose
}) => {
  if (!data) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent id="sideDrawer" side="right" className="w-[400px] sm:w-[400px]">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Evidence Details
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Metric */}
          <div>
            <h2 className="text-base font-semibold mb-2">
              {data.metric}
            </h2>
            <Badge variant="outline" className="mb-3">
              Impact: {data.impact}
            </Badge>
          </div>

          {/* Definition */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Definition
            </h3>
            <p className="text-sm leading-relaxed">
              {data.definition}
            </p>
          </div>

          {/* Counts */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Affected Users
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="font-medium text-sm">Segment 1</span>
                <span className="text-sm font-mono">
                  {data.segmentCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="font-medium text-sm">Total Users</span>
                <span className="text-sm font-mono">
                  {data.totalCount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="font-medium text-sm text-primary">Percentage</span>
                <span className="text-sm font-mono text-primary">
                  {((data.segmentCount / data.totalCount) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* SQL Query */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Query
            </h3>
            <div className="bg-card border rounded-lg p-3">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                <code>{data.sqlQuery}</code>
              </pre>
            </div>
          </div>

          {/* Additional Context */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              This metric was calculated using data from the last 7 days. 
              Updates are processed every 6 hours.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};