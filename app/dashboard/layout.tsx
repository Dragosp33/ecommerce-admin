import Nav from '@/app/_ui/sidenav';

// fetch categories here.

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='bg-bgGray min-h-screen '>
      <div className='md:flex'>
        <Nav />
        <div className='flex-grow p-4'>{children}</div>
      </div>
    </div>
  );
};

export default layout;
