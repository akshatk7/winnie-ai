import React from 'react';

export const StickyHeader: React.FC = () => {
  return (
    <div 
      id="stickyHeader" 
      className="fixed top-0 left-0 right-0 h-8 bg-primary text-primary-foreground flex items-center justify-center z-50"
    >
      <span className="text-sm font-medium">
        Objective · Reduce churn below 5%
      </span>
    </div>
  );
};