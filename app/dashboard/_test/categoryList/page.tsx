import React from 'react';
import CategoryList from '@/app/_ui/categories/CategoryList';
import { fetchAllCategories, getCategoryTree } from '@/app/_lib/data';

async function page() {
  const all = await getCategoryTree();
  return (
    <div>
      <CategoryList categories={all} />
    </div>
  );
}

export default page;
