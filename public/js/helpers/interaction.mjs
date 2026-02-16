import { d3 } from './index.mjs';
import * as render from '../render/index.mjs';

export const highlight_bubble = function (names) {
  if (!Array.isArray(names)) names = [names];

  const highlight_bubble = d3.selectAll('g.packs circle').filter(c => {
    if (c.children) {
      return names.includes(c.data.name);  
    } else {
      return names.includes(c.parent.data.name);
    }
  }).join(d3.selectAll('g.packs.lock'));
  highlight_bubble//.transition()
    .style('stroke-opacity', 0)
    .style('fill-opacity', 1);

  const other_bubbles = d3.selectAll('g.packs circle:not(.lock)')
  .filter(function () {
    return !highlight_bubble.nodes().includes(this);
  });
  other_bubbles//.transition()
    .style('stroke-opacity', 1)
    .style('fill-opacity', 0);

  const highlight_label = d3.selectAll('g.label').filter(c => names.includes(c.data.name));
  highlight_label.moveToFront()
    .style('text-anchor', 'start');
  highlight_label.selectAll('rect.bg')
    .transition()
    .style('fill-opacity', 1);
  highlight_label.selectAll('tspan')
    .transition()
    .delay((c, i) => i * 25)
    .style('fill', '#FFF')
    .style('fill-opacity', 1)
    .attr('x', c => {
      const r = d3.selectAll('g.packs circle').filter(b => b.data.name === c.name)?.datum().r;
      return (r ?? 0) + 5;
    });

  const other_labels = d3.selectAll('g.label:not(.hidden):not(.lock)').filter(function () {
    return !highlight_label.nodes().includes(this);
  });
  other_labels.style('text-anchor', null)
  other_labels.selectAll('rect.bg')
    .transition()
    .style('fill-opacity', 0);
  other_labels.selectAll('tspan')
    .transition()
    .delay((c, i) => i * 25)
    .style('fill', null)
    .style('fill-opacity', 0)
    .attr('x', 0);
}

export const highlight_tags = function (tags) {
  const highlight_label = d3.selectAll('g.label.hidden')
    .filter(c => tags.includes(c.data.name))
  highlight_label.moveToFront()
    .style('display', 'inline')
    .style('text-anchor', 'middle');
  highlight_label.selectAll('rect.bg')
    .transition()
    .style('fill-opacity', 1);
  highlight_label.selectAll('tspan')
    .transition()
    .delay((d, i) => i * 25)
    .attr('x', 0)
    .style('fill-opacity', 1);

  const other_labels = d3.selectAll('g.label.hidden').filter(function () {
    return !highlight_label.nodes().includes(this);
  });
  other_labels.style('text-anchor', 'start');
  other_labels.selectAll('rect.bg')
    .transition()
    .style('fill-opacity', 0)
  .on('end', function () {
    other_labels.style('display', 'none');
  });
  other_labels.selectAll('tspan')
    .transition()
    .delay((d, i) => i * 25)
    .attr('x', d => d.r)
    .style('fill-opacity', 0);
}