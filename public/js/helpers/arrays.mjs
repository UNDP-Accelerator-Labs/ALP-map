export const nest = function (kwargs) {
  const { key, keep } = kwargs || {};
  // THIS IS NOT QUITE THE SAME FUNCTION AS IN distances.js, THIS MORE CLOSELY RESEMBLES d3.nest
  const arr = [];
  this.forEach((d) => {
    const groupby = typeof key === 'function' ? key(d) : d[key];
    if (!arr.find((c) => c.key === groupby)) {
      if (keep) {
        const obj = {};
        obj.key = groupby;
        obj.values = [d];
        obj.count = 1;
        if (Array.isArray(keep)) keep.forEach((k) => (obj[k] = d[k]));
        else obj[keep] = d[keep];
        arr.push(obj);
      } else arr.push({ key: groupby, values: [d], count: 1 });
    } else {
      arr.find((c) => c.key === groupby).values.push(d);
      arr.find((c) => c.key === groupby).count++;
    }
  });
  return arr;
};