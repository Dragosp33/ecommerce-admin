'use client';

import { useRef } from 'react';

export default function DropDownClient({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const collapseRef: any = useRef();
  function collapse() {
    const CollapseElement = collapseRef.current;
    if (!collapseRef.current) return;
    CollapseElement.classList.toggle('collapse-dropdown');
  }
  return (
    <div className='w-full p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-2 md:p-2 mb-3'>
      <button onClick={collapse}> {title} </button>
      <div
        className='transition-all duration-1000 collapse-dropdown'
        ref={collapseRef}
        style={{ maxHeight: '1000px' }}
      >
        {children}
      </div>
    </div>
  );
}
