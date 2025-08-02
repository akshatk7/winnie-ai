import React, { useState } from 'react';
import { Mail, Smartphone, MessageSquare, Edit3, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Asset } from './ChatFirstCopilot';

interface AssetCardProps {
  asset: Asset;
  onUpdateContent: (assetId: string, content: string, subject?: string) => void;
  onToggleEdit: (assetId: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onUpdateContent,
  onToggleEdit
}) => {
  const [editContent, setEditContent] = useState(asset.content);
  const [editSubject, setEditSubject] = useState(asset.subject || '');

  const getIcon = () => {
    switch (asset.type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'push':
        return <Smartphone className="h-5 w-5" />;
      case 'sms':
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (asset.type) {
      case 'email':
        return 'Email Campaign';
      case 'push':
        return 'Push Notification';
      case 'sms':
        return 'SMS Message';
    }
  };

  const handleSave = () => {
    onUpdateContent(asset.id, editContent, editSubject);
    onToggleEdit(asset.id);
  };

  const handleCancel = () => {
    setEditContent(asset.content);
    setEditSubject(asset.subject || '');
    onToggleEdit(asset.id);
  };

  // Check if generation failed (simulate error)
  const simulateError = false; // This would come from actual generation logic

  if (simulateError) {
    return (
      <Card id="errorCard" className="border-2 border-destructive">
        <CardContent className="p-4">
          <div className="text-center text-destructive">
            <p className="font-medium">Creative generation failed. Try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="assetCard" className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {getIcon()}
            {getTitle()}
          </CardTitle>
          
          {!asset.editable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleEdit(asset.id)}
              className="gap-1"
            >
              <Edit3 className="h-3 w-3" />
              Edit copy
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {asset.editable ? (
          <>
            {asset.type === 'email' && (
              <div className="space-y-2">
                <Label htmlFor={`subject-${asset.id}`}>Subject Line</Label>
                <Input
                  id={`subject-${asset.id}`}
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor={`content-${asset.id}`}>
                {asset.type === 'email' ? 'Email Content' : 'Message Content'}
              </Label>
              <Textarea
                id={`content-${asset.id}`}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                placeholder="Enter your message content..."
              />
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            {asset.subject && (
              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <p className="font-medium text-sm mt-1">{asset.subject}</p>
              </div>
            )}
            
            <div>
              <Label className="text-xs text-muted-foreground">
                {asset.type === 'email' ? 'Content' : 'Message'}
              </Label>
              <p className="text-sm mt-1 leading-relaxed">{asset.content}</p>
            </div>
          </>
        )}
        
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Character count: {asset.content.length}</span>
            <span className="capitalize">{asset.type}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};