import mongoose from 'mongoose';
import { Revenue } from './definitions';

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US'
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

export function replaceIdDoc(doc: mongoose.mongo.BSON.Document | null) {
  if (!doc) {
    return null;
  }
  doc.id = doc._id.toString();
  delete doc._id;
  return doc;
}

interface CategoryItem {
  name: string;
  id: string;
  path: string | null;
  parent: string | null;
}

interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

/**
 * Utility function to transform Categories into a disconnected Graph
 * Containing trees for each main category. Each Main category = root of the tree.
 * @param items - Array of Categories from MongoDB
 * @returns - Array of TreeNodes - Main categories and their tree
 */
export function buildTree(items: CategoryItem[]): TreeNode[] {
  const map: { [key: string]: TreeNode } = {};
  const roots: TreeNode[] = [];

  // Map each item by id and add a `children` array

  items.forEach((item: CategoryItem) => {
    map[item.id] = { name: item.name, id: item.id, children: [] };
  });

  // Link each item to its parent or add it as a root
  items.forEach((item) => {
    if (item.parent === null) {
      roots.push(map[item.id]);
    } else {
      const x = map[item.parent];
      map[item.parent].children.push(map[item.id]);
    }
  });

  //console.log(JSON.stringify(roots, null, 2));
  return roots;
}
