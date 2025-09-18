export const i18nt = (key: string, ...args: any[]) => key;
export const getRangeDisplayItems = (items, columns, num = 10) => {
  if (columns.length > 1) { // Tree
    const sliced = sliceTree(items, columns, num);
    const total = countItems(items);
    const getText = (xs) => {
      const xsText = xs.map((x, idx) => `${columns[idx].display}='${x}'`).join(' AND ');
      return `[${xsText}]`;
    };

    return {
      items: sliced.map(getText),
      hasEllipsis: total > num,
      total,
    };
  } // Array
  const format = columns[0] && columns[0].formatValue || (v => v);

  return {
    items: items.slice(0, 10).map(i => format(i.value)),
    hasEllipsis: items.length > 10,
    total: items.length,
  };
};
const sliceTree = (xs, columns, num = 10, prevConsist = [], prevSliced = []) => {
  const format = columns[0] && columns[0].formatValue || (v => v);
  const sliced = prevSliced;

  xs.some((x) => {
    if (sliced.length === num) return true;

    const consist = prevConsist.concat(format(x.value));
    // x is a tree;
    if (columns.length > 1) {
      const nextColumns = columns.slice(1);
      sliceTree(x.children, nextColumns, num, consist, sliced);
      return false;
    }
    // x is leaf
    sliced.push(consist);
    return false;
  });

  return sliced;
};

const countItems = (items = []) => {
  if (items.length === 0) return 1;

  return items.reduce((total, i) => (total + countItems(i.children)), 0);
};
