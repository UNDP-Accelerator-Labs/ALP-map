import { d3, arrays } from '../helpers/index.mjs';
import * as render from './index.mjs';
import { colors } from './settings.mjs';

export const main = function (data, kwargs) {
  let { nodes, links } = data || {};
  let { width, height, svg } = kwargs || {};
  if (!svg) {
    const canvas = render.canvas('#canvas');
    svg = canvas.svg;
    width = canvas.width;
    height = canvas.height;
  }

  const date_range = d3.selectAll('#interaction-panel g.handle').data().map(d => d.value);
  const threshold = (d3.range(...date_range).length + 1) * 5; // 5 communications between two labs per year
  /*
  Filter according to the selected time range
  */
  links = links.filter(d => d.year >= Math.min(...date_range) && d.year <= Math.max(...date_range));
  const nested_links = arrays.nest.call(links, { key: d => `${d.source}---${d.target}`, keep: ['source', 'target', 'source_pos', 'target_pos'] })
  .map(d => {
    const { source, target, source_pos, target_pos } = d || {};
    const count = d3.sum(d.values, c => c.count);
    return { source, target, source_pos, target_pos, count };
  }).filter(d => d.count >= threshold);
  
  const g = svg.addElems('g', 'network')
  g.addElems('path', 'link', nested_links)
    .attr('d', d => {
      const { source_pos, target_pos } = d || {}
      if (source_pos.length > 0 && target_pos.length > 0) {
        const midpoint = [
          Math.min(source_pos[0], target_pos[0]) + (Math.max(source_pos[0], target_pos[0]) - Math.min(source_pos[0], target_pos[0]))/ 2,
          d3.mean([source_pos[1], target_pos[1]]) >= height/ 2 ? Math.max(source_pos[1], target_pos[1]) : Math.min(source_pos[1], target_pos[1]),
        ];
        return `M ${source_pos.join(' ')} Q ${midpoint.join(' ')} ${target_pos.join(' ')}`;
      } else return null
    })
    .attr('stroke-width', d => d.count/ 10)
    .attr('stroke', colors['Accelerator Lab'])
    .attr('stroke-opacity', .1)
    .attr('fill', 'none');
}