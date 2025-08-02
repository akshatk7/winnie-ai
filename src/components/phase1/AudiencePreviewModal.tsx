import React from 'react';
import { X, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AudiencePreviewModalProps {
  open: boolean;
  onClose: () => void;
  targetCount: number;
}

interface SampleUser {
  user_id: string;
  join_date: string;
  platform: string;
  last_active: string;
}

export const AudiencePreviewModal: React.FC<AudiencePreviewModalProps> = ({
  open,
  onClose,
  targetCount
}) => {
  // Generate sample data
  const sampleUsers: SampleUser[] = Array.from({ length: 10 }, (_, i) => ({
    user_id: `user_${(i + 1).toString().padStart(3, '0')}`,
    join_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
    platform: ['iOS', 'Android', 'Web'][Math.floor(Math.random() * 3)],
    last_active: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
  }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full h-[500px]">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Audience Preview
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 flex-1">
          <div className="text-sm text-muted-foreground">
            Sample of 10 users from {targetCount.toLocaleString()} total targeted users
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">User ID</TableHead>
                  <TableHead className="w-32">Join Date</TableHead>
                  <TableHead className="w-24">Platform</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-mono text-xs">
                      {user.user_id}
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.join_date}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        user.platform === 'iOS' 
                          ? 'bg-blue-100 text-blue-800' 
                          : user.platform === 'Android'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {user.platform}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.last_active}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            This is a representative sample. The actual campaign will target all {targetCount.toLocaleString()} qualified users based on the defined criteria.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};