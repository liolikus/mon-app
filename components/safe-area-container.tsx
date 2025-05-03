import React from 'react';
import { SafeAreaInsets } from "@/types";

interface SafeAreaContainerProps {
  children: React.ReactNode;
  insets?: SafeAreaInsets;
}

export default function SafeAreaContainer({ 
  children, 
  insets = { top: 0, bottom: 0, left: 0, right: 0 } 
}: SafeAreaContainerProps) {
  return (
    <div 
      style={{
        paddingTop: `${insets.top || 0}px`,
        paddingBottom: `${insets.bottom || 0}px`,
        paddingLeft: `${insets.left || 0}px`,
        paddingRight: `${insets.right || 0}px`,
      }}
    >
      {children}
    </div>
  );
}

