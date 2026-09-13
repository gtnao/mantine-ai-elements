'use client';
import { Shimmer } from 'mantine-ai-elements';
import { useRef } from 'react';

export default function ShimmerExample() {
  const ref = useRef<HTMLHeadingElement>(null);
  return (
    <Shimmer
      ref={ref}
      component="h2"
      data-testid="shimmer-example"
      duration={3}
      spread={4}
      c="grape.7"
      highlightColor="pink.2"
    >
      Preparing an answer
    </Shimmer>
  );
}
