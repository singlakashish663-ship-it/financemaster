import React, { useMemo } from 'react';

export default function StarField({ count = 80 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3,
        duration: 2 + Math.random() * 4,
        delay: Math.random() * 4,
        opacity: 0.3 + Math.random() * 0.7,
      })),
    [count]
  );

  return (
    <div className="stars-bg" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--duration': `${s.duration}s`,
            '--delay': `${s.delay}s`,
            '--opacity': s.opacity,
          }}
        />
      ))}
    </div>
  );
}
