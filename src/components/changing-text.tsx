'use client';

import { useEffect, useRef } from 'react';

export function ChangingText() {
  const changingWordRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const words = ['Elige ser siempre el mejor', 'El futuro de la construcción es digital, industrial y sostenible'];
    const colors = [
      'from-blue-600 via-purple-600 to-blue-800',
      // 'from-orange-500 via-red-500 to-pink-600',
      // 'from-purple-500 via-indigo-500 to-blue-600',
      'from-purple-500 via-orange-500 to-red-600',
      // 'from-cyan-500 via-blue-500 to-indigo-600',
    ];
    let currentIndex = 0;
    const el = changingWordRef.current;
    if (!el) return;

    const changeWord = () => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % words.length;
        el.textContent = words[currentIndex];
        el.className = `inline-block transition-all duration-500 ease-in-out text-transparent bg-clip-text bg-gradient-to-r ${colors[currentIndex]}`;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 300);
    };

    const intervalId = setInterval(changeWord, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <span
      ref={changingWordRef}
      className="inline-block transition-all duration-10000 ease-in-out text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800"
    >Elige ser siempre el mejor
    </span>
  );
}
