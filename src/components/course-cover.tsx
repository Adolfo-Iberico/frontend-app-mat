import { useState } from 'react';
import type { Course } from '@/lib/types';

interface CourseCoverProps {
  course: Course;
  className?: string;
}

function getCourseArtType(course: Course) {
  const subject = `${course.title} ${course.category ?? ''} ${course.topic ?? ''}`.toLocaleLowerCase();

  if (/geometr|tri[aá]ng|[aá]ngul|c[ií]rcul|per[ií]metr|[aá]rea/.test(subject)) return 'geometry';
  if (/fracci|porcent|aritm|n[uú]mer|operaci|suma|resta|multiplic/.test(subject)) return 'numbers';
  return 'algebra';
}

function CourseArtwork({ type }: { type: 'geometry' | 'numbers' | 'algebra' }) {
  if (type === 'geometry') {
    return (
      <svg viewBox="0 0 600 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="430" cy="155" r="92" fill="none" stroke="white" strokeOpacity=".2" strokeWidth="2" />
        <circle cx="430" cy="155" r="56" fill="none" stroke="white" strokeOpacity=".35" strokeWidth="2" />
        <path d="M92 255 220 65l126 190H92Z" fill="white" fillOpacity=".08" stroke="white" strokeOpacity=".78" strokeWidth="4" strokeLinejoin="round" />
        <path d="M220 65v190m-37-55h37" fill="none" stroke="white" strokeOpacity=".55" strokeWidth="3" />
        <circle cx="220" cy="65" r="7" fill="white" />
        <circle cx="92" cy="255" r="7" fill="white" />
        <circle cx="346" cy="255" r="7" fill="white" />
        <path d="M202 228a26 26 0 0 1 18-7" fill="none" stroke="white" strokeOpacity=".8" strokeWidth="3" />
      </svg>
    );
  }

  if (type === 'numbers') {
    return (
      <svg viewBox="0 0 600 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g transform="rotate(-8 205 160)">
          <rect x="95" y="67" width="172" height="184" rx="22" fill="white" fillOpacity=".1" stroke="white" strokeOpacity=".75" strokeWidth="3" />
          <text x="181" y="142" fill="white" fillOpacity=".94" fontSize="49" textAnchor="middle" fontFamily="sans-serif" fontWeight="700">1/2</text>
          <path d="M135 164h92" stroke="white" strokeOpacity=".7" strokeWidth="3" />
          <text x="181" y="218" fill="white" fillOpacity=".8" fontSize="31" textAnchor="middle" fontFamily="sans-serif">25% + ¼</text>
        </g>
        <circle cx="416" cy="114" r="62" fill="white" fillOpacity=".12" />
        <circle cx="416" cy="114" r="36" fill="none" stroke="white" strokeOpacity=".72" strokeWidth="3" />
        <path d="M416 78a36 36 0 0 1 36 36h-36Z" fill="white" fillOpacity=".72" />
        <path d="M340 235h137m-112-24v48m47-48v48m47-48v48" stroke="white" strokeOpacity=".52" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 600 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <path d="M82 251h438M124 278V51" stroke="white" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
      <path d="M140 230c57-11 60-119 126-119s68 93 126 78 54-89 109-112" fill="none" stroke="white" strokeOpacity=".8" strokeWidth="5" strokeLinecap="round" />
      <g fill="white">
        <circle cx="140" cy="230" r="7" /><circle cx="266" cy="111" r="7" />
        <circle cx="392" cy="189" r="7" /><circle cx="501" cy="77" r="7" />
      </g>
      <rect x="334" y="45" width="90" height="54" rx="14" fill="white" fillOpacity=".12" stroke="white" strokeOpacity=".6" strokeWidth="2" transform="rotate(8 379 72)" />
      <text x="379" y="82" fill="white" fillOpacity=".92" fontSize="29" textAnchor="middle" fontFamily="sans-serif" fontWeight="700">x + 2</text>
      <circle cx="183" cy="91" r="39" fill="white" fillOpacity=".1" />
      <text x="183" y="103" fill="white" fillOpacity=".8" fontSize="34" textAnchor="middle" fontFamily="sans-serif">π</text>
    </svg>
  );
}

export function CourseCover({ course, className }: CourseCoverProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const artType = getCourseArtType(course);
  const colors = {
    geometry: 'from-cyan-500 via-blue-600 to-indigo-800',
    numbers: 'from-amber-400 via-orange-500 to-rose-700',
    algebra: 'from-violet-500 via-purple-600 to-indigo-800',
  }[artType];

  return (
    <div
      role="img"
      aria-label={`Portada de ${course.title}`}
      className={`relative isolate overflow-hidden bg-gradient-to-br ${colors} ${className ?? ''}`}
    >
      {course.image_url && !imageFailed ? (
        <img
          src={course.image_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <CourseArtwork type={artType} />
          <div className="absolute bottom-3 left-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75">
            {course.category || course.topic || 'Matemáticas'}
          </div>
        </>
      )}
    </div>
  );
}
