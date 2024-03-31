'use client';
import { useEditState } from '@/app/_lib/EditProvider';
import Link from 'next/link';

const VariantTest = () => {
  const l = useEditState();
  console.log(l.state);

  return (
    <div>
      <h1>Variants Test</h1>
      <div>Title: {l.state.firstObject.title}</div>
    </div>
  );
};

export default VariantTest;
