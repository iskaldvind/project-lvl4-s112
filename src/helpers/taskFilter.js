export const getParams = query =>
  Object.keys(query).reduce((acc, key) => {
    if (query[key] !== 'All' && query[key] !== '') {
      return { ...acc, [key]: Number(query[key]) };
    }
    return acc;
  }, {});