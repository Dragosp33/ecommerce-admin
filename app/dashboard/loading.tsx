import { FaceSmileIcon } from '@heroicons/react/24/outline';

const loading = () => {
  return (
    <div className='flex justify-center items-center'>
      <div className='animate-spin border-t-4 border-blue-500 rounded-full w-12 h-12'></div>
      <FaceSmileIcon className='absolute' width={24} height={24} />
    </div>
  );
};

export default loading;
