import { d3_extended as d3 } from './d3.extensions.mjs';
import { nest } from './arrays.mjs';

export const getTags = function (d) {
  let tags = [];
  if (d.tags.filter(c => c.type === 'thematic_areas').length > 0) {
    tags = d.tags.filter(c => c.type === 'thematic_areas');
  } else {
    tags = d.source?.tags.filter(c => c.type === 'thematic_areas') || [];
  }
  tags.forEach(c => c.pad_id = d.pad_id);
  return tags;
}

export const structureHierarchy = function (pads, taxonomy) {
  /* 
  Filter according to the selected time range
  */
  const date_range = d3.selectAll('#interaction-panel g.handle').data().map(d => d.value);
  pads = pads.filter(d => {
    return +new Date(d.created_at).getFullYear() >= Math.min(...date_range) 
    && +new Date(d.created_at).getFullYear() <= Math.max(...date_range);
  });

  const open_tags = pads.map(d => getTags(d)).flat()
  .filter(d => d.name.trim().length > 0);
  
  const nested_open_tags = nest.call(open_tags, { key: 'tag_id', keep: 'name' });
  nested_open_tags.forEach(d => {
    d.keyword = d.name;
    d.name = d.key;
    d.tag_id = d.key;
    d.category = taxonomy.find(c => c.id === d.name)?.category;
    d.value = d.count;
    d.pads = d.values.map(c => c.pad_id).flat();
    delete d.key;
    delete d.count;
  });
  const nested_categories = nest.call(nested_open_tags, { key: 'category' });
  nested_categories.forEach(d => {
    d.name = d.key;
    d.children = d.values;
    d.pads = d.values.map(c => c.pads).flat();
    delete d.key;
    delete d.count;
  });
  return { tags: nested_open_tags, hierarchy: { name: 'root', children: nested_categories } };
}