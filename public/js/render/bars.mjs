import { d3, strings } from '../helpers/index.mjs';
import * as render from './index.mjs';
import { colors } from './settings.mjs';

export const main = function (nodes, kwargs) {
  let { width, height, svg } = kwargs || {};
  if (!svg) {
    const canvas = render.canvas('#canvas');
    svg = canvas.svg;
    width = canvas.width;
    height = canvas.height;
  }
  const bar_height = 75;

  const actor_types = [...new Set(nodes.map(d => d.type))].filter(d => !['accelerator lab', 'unusual partner'].includes(d.toLowerCase()));
  const counts = actor_types.map(d => { return { type: d, count: nodes.filter(c => c.type === d).length } });
  counts.sort((a, b) => a.count - b.count);

  const x = d3.scaleBand(counts.map(d => d.type), [0, 100]).paddingInner(.25);
  const y = d3.scaleLinear([0, Math.max(...counts.map(d => d.count))], [0, bar_height]);

  const g = svg.addElems('g', 'bars', [counts])
    .attr('transform', `translate(${[width-150, height-150]})`)
  g.addElems('rect', 'bar', d => d, d => d.type)
    .attr('fill', d => colors[d.type])
    .attr('width', x.bandwidth())
  .transition()
    .attr('height', d => y(d.count))
    .attr('x', d => x(d.type))
    .attr('y', d => Math.max(...y.range()) - y(d.count));
  
  g.addElems('g', 'axis-bottom')
    .attr('transform', `translate(${[0, bar_height]})`)
  .transition()
  .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .attr('fill', 'rgba(255,255,245,.5)')
    .attr('text-anchor', 'end')
    .text(d => strings.capitalize.call(d));
}