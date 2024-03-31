'use client';
import { useEditState } from '@/app/_lib/EditProvider';
import Link from 'next/link';
import { useEffect } from 'react';

const Test = () => {
  const l = useEditState();
  console.log('LOGGING FROM TEST OF FIRST STEP EDIT', l.state);
  function k() {
    l.updateState({
      firstObject: {
        ...l.state.firstObject,
        title: 'llalal',
      },
    });
  }
  return (
    <div>
      test
      <button onClick={k} type='button'>
        {' '}
        click to change state{' '}
      </button>
      <Link href={'edit/variants'}> GO TO VARIANTS </Link>
    </div>
  );
};

export default Test;
