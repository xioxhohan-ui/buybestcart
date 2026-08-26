'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { getAnimationProfile, MOTION } from '@/lib/animation';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  staggerChildren?: string;
  animationType?: string;
  delay?: number;
}

export default function AnimatedSection({
  children,
  className,
  style,
  id,
  staggerChildren,
  animationType,
  delay = 0,
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const profile = getAnimationProfile();

    if (profile.isReduced) return;

    const ctx = gsap.context(() => {
      if (staggerChildren) {
        // Group cards / child elements with controlled stagger
        const targets = sectionRef.current?.querySelectorAll(staggerChildren);
        if (targets && targets.length > 0) {
          gsap.fromTo(
            targets,
            { opacity: 0, y: profile.revealDistance },
            {
              opacity: 1,
              y: 0,
              duration: profile.duration,
              ease: MOTION.ease.primary,
              stagger: profile.staggerDuration || MOTION.stagger.normal,
              delay,
            }
          );
        }
      } else {
        // Whole-block fade
        gsap.fromTo(
          sectionRef.current,
          { opacity: 0, y: profile.revealDistance },
          {
            opacity: 1,
            y: 0,
            duration: profile.duration,
            ease: MOTION.ease.primary,
            delay,
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [staggerChildren, delay, animationType]);

  return (
    <div ref={sectionRef} id={id} className={className} style={style}>
      {children}
    </div>
  );
}
