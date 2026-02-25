import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  large?: boolean;
}

export interface AiResponse {
  answer: string;
  steps: string[];
}