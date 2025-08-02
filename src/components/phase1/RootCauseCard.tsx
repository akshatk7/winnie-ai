import React from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RootCause } from './ChatFirstCopilot';

interface RootCauseCardProps {
  data: RootCause;
  onSeeDetails: () => void;
}

export const RootCauseCard: React.FC<RootCauseCardProps> = ({
  data,
  onSeeDetails
}) => {
  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card id="rootCauseCard" className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {data.impact === 'High' ? (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            ) : (
              <TrendingDown className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle className="text-base">{data.title}</CardTitle>
          </div>
          <Badge variant={getImpactColor(data.impact)}>
            {data.impact}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {data.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="font-medium">Affected: </span>
            <span>{data.segmentCount.toLocaleString()} / {data.totalCount.toLocaleString()}</span>
          </div>
          
          <Button
            variant="link"
            size="sm"
            onClick={onSeeDetails}
            className="h-auto p-0 text-primary"
          >
            See details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};