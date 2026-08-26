import React from 'react';
import Link from 'next/link';

interface AffiliateLinkDisclosureProps {
  text?: string;
  className?: string;
  style?: React.CSSProperties;
  showLink?: boolean;
}

export default function AffiliateLinkDisclosure(_props: AffiliateLinkDisclosureProps) {
  // Line-level affiliate disclosure micro-bar removed per site-wide design specification
  return null;
}
