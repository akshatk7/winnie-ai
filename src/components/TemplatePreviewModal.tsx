import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CampaignAction, ActionVariant } from '@/data/actionLibrary';
import { Mail, MessageSquare, Bell, Smartphone } from 'lucide-react';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: CampaignAction;
  variant: ActionVariant;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  action,
  variant
}) => {
  const generateTemplateContent = () => {
    const actionName = action.name.toLowerCase();
    const variantName = variant.name.toLowerCase();
    
    if (actionName.includes('email')) {
      return {
        type: 'Email',
        icon: <Mail className="h-5 w-5" />,
        templates: [
          {
            subject: "We miss you! Come back and save {{discount}}%",
            preview: "Your personalized offer is waiting inside...",
            content: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a; font-size: 24px;">Hey {{firstName}},</h1>
                <p>We noticed you haven't been around lately, and we wanted to reach out personally.</p>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; color: white; text-align: center; margin: 20px 0;">
                  <h2 style="margin: 0; font-size: 20px;">Welcome Back Offer</h2>
                  <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">${variant.name}</p>
                  <p style="margin: 0;">Use code: WELCOME{{discount}}</p>
                </div>
                <p>This exclusive offer expires in 7 days - don't miss out!</p>
                <a href="#" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Claim Your Offer</a>
              </div>
            `
          },
          {
            subject: "{{firstName}}, your exclusive offer expires soon!",
            preview: "Only 2 days left to save big...",
            content: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #fef2f2; border: 2px solid #fecaca; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="color: #dc2626; margin: 0;">⏰ Offer Expires in 2 Days!</h2>
                </div>
                <p>Hi {{firstName}},</p>
                <p>This is a friendly reminder that your personalized ${variant.name} offer expires soon.</p>
                <p>Don't let this opportunity slip away - return now and save big on your next purchase!</p>
                <a href="#" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Use Offer Now</a>
              </div>
            `
          }
        ]
      };
    }
    
    if (actionName.includes('sms')) {
      return {
        type: 'SMS',
        icon: <MessageSquare className="h-5 w-5" />,
        templates: [
          {
            subject: "SMS Message 1",
            preview: "160 characters max",
            content: `Hi {{firstName}}! 👋 We miss you! Come back now and get ${variant.name} off your next order. Use code: BACK{{discount}}. Expires in 7 days! 🎉`
          },
          {
            subject: "SMS Message 2", 
            preview: "Urgent reminder",
            content: `⏰ LAST CHANCE {{firstName}}! Your ${variant.name} offer expires in 24hrs. Don't miss out! Use: SAVE{{discount}} → [link]`
          }
        ]
      };
    }
    
    if (actionName.includes('push')) {
      return {
        type: 'Push Notification',
        icon: <Bell className="h-5 w-5" />,
        templates: [
          {
            subject: "Welcome Back Notification",
            preview: "Appears on lock screen",
            content: `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; max-width: 320px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                  <div style="width: 32px; height: 32px; background: #667eea; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">A</div>
                  <div>
                    <div style="font-weight: 600; font-size: 14px;">Your App</div>
                    <div style="font-size: 12px; color: #64748b;">now</div>
                  </div>
                </div>
                <div style="font-weight: 600; margin-bottom: 4px;">Miss us? Get ${variant.name} off! 🎉</div>
                <div style="font-size: 14px; color: #475569;">Tap to claim your personalized welcome back offer</div>
              </div>
            `
          }
        ]
      };
    }
    
    if (actionName.includes('in-app')) {
      return {
        type: 'In-App Message',
        icon: <Smartphone className="h-5 w-5" />,
        templates: [
          {
            subject: "Modal Message",
            preview: "Full-screen overlay",
            content: `
              <div style="background: rgba(0,0,0,0.5); padding: 40px; border-radius: 0;">
                <div style="background: white; border-radius: 16px; padding: 32px; text-align: center; max-width: 400px; margin: 0 auto;">
                  <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                  <h2 style="font-size: 24px; margin-bottom: 12px; color: #1a1a1a;">Welcome Back!</h2>
                  <p style="color: #666; margin-bottom: 20px;">We've prepared a special ${variant.name} offer just for you!</p>
                  <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="font-size: 20px; font-weight: bold;">${variant.name} OFF</div>
                    <div style="font-size: 14px;">Your Next Purchase</div>
                  </div>
                  <button style="background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; width: 100%; margin-bottom: 8px;">Claim Offer</button>
                  <button style="background: transparent; color: #666; border: none; padding: 8px; font-size: 14px;">Maybe later</button>
                </div>
              </div>
            `
          }
        ]
      };
    }

    // Default template for other action types
    return {
      type: 'Message Preview',
      icon: <MessageSquare className="h-5 w-5" />,
      templates: [
        {
          subject: `${action.name} Template`,
          preview: "Template preview",
          content: `
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3>${action.name}</h3>
              <p>${variant.description}</p>
              <p><strong>Variant:</strong> ${variant.name}</p>
              <p><strong>Expected Impact:</strong> ${variant.expectedImpact}%</p>
            </div>
          `
        }
      ]
    };
  };

  const templateData = generateTemplateContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {templateData.icon}
            {templateData.type} Templates - {action.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{action.category}</Badge>
            <Badge variant="outline">{variant.name}</Badge>
          </div>
          
          <Separator />
          
          <div className="space-y-6">
            {templateData.templates.map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.subject}</CardTitle>
                  {template.preview && (
                    <p className="text-sm text-muted-foreground">{template.preview}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div 
                    className="border rounded-lg p-4 bg-muted/30"
                    dangerouslySetInnerHTML={{ __html: template.content }}
                  />
                  
                  {templateData.type === 'SMS' && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Character count: {template.content.length}/160
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewModal;