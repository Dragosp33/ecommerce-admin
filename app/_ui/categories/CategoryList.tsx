import Link from 'next/link';
import React from 'react';

const CategoryList = ({
  categories,
  categoryName,
}: {
  categories: any[];
  categoryName?: string;
}) => {
  const inactiveLink = 'flex gap-1 p-1';
  const activeLink = inactiveLink + ' bg-highlight text-black rounded-sm';
  categories.forEach((cat) => {
    console.log('FOR CATEGORY: ', cat.name);
    console.log(cat, cat.children);
  });
  const renderCategory = (category: any) => {
    //console.log(category);
    return (
      <>
        {category && category.name && (
          <div
            className={
              'border-b-2 border-b-gray-100 py-2 ' +
              (categoryName === category.name ? activeLink : inactiveLink)
            }
          >
            <Link href={`/dashboard/products/c/${category.name}`}>
              {category.name}
            </Link>
          </div>
        )}
        {category && category.children && (
          <ul>
            {category.children.map((child: any) => (
              <div key={child._id} className='ml-5'>
                {renderCategory(
                  categories.find(
                    (x) => x._id.toString() === child._id.toString()
                  )
                )}{' '}
              </div>
            ))}
          </ul>
        )}
      </>
    );
  };

  return (
    <ul>
      {categories.map((category) =>
        category.path === null ? (
          <li key={category._id.toString()}>{renderCategory(category)}</li>
        ) : null
      )}
    </ul>
  );
};

export default CategoryList;
