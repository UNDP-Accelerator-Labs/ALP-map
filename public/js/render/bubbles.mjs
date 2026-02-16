import { d3, strings, arrays, parsers, interaction } from '../helpers/index.mjs';
import * as render from './index.mjs';
import { colors } from './settings.mjs';

export const main = function (pads, taxonomy, kwargs) {
  let { width, height, svg, ctrs } = kwargs || {};
  if (!svg) {
    const canvas = render.canvas('#canvas');
    svg = canvas.svg;
    width = canvas.width;
    height = canvas.height;
  }

  /*
  Structure the hierarchy
  */
  const { tags, hierarchy } = parsers.structureHierarchy(pads, taxonomy);
  /*
  Tag the pads with the category information
  */
  pads.forEach(d => {
    d.categories = hierarchy.children.filter(c => c.pads.includes(d.pad_id)).map(c => c.name);
  });

  const pack = d => d3.pack()
    .size([width, height])
    .padding(3)
  (d3.hierarchy(d)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value));
  const root = pack(hierarchy);

  const color = d3.scaleLinear()
    .domain([0, 5])
    .range([colors['fluo'], 'rgb(93,93,93)'])
    .interpolate(d3.interpolateRgb);

  const nodes = svg.addElems('g', 'packs')
  nodes.addElems('circle', null, root.descendants().slice(1), d => d.data.name)
    .classed('lock', false)
    .on('click', function (evt, d) {
      d3.selectAll('g.packs circle, g.label')
        .classed('lock', false)
      .filter(c => {
        return c.data.name === d.data.name
        || c.parent?.data.name === d.data.name;
      }).classed('lock', true);

      if (d.parent === root) {
        interaction.highlight_bubble(d.data.name);
        render.cards(pads.filter(c => d.data.pads.includes(c.pad_id)));
      }
    })
  .transition()
    .delay((d, i) => i * 2)
    .attr('transform', d => `translate(${[d.x, d.y]})`)
    .attr('r', d => d.r)
    .style('fill', d => d.children ? color(d.depth) : '#FFF')
    .style('fill-opacity', 1)
    .style('stroke', d => d.children ? colors['fluo'] : 'rgba(255,255,255,.25)')
    .style('stroke-opacity', 0)
    .style('pointer-events', d => !d.children ? 'none' : null);
    // .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

    /*
    Add the text labels
    */
    const label = svg.addElems('g', 'label', root.descendants(), d => d.data.name)
      .classed('hidden', d => d.parent !== root)
      .style('font', '10px sans-serif')
      .attr('pointer-events', 'none')
      .style('text-anchor', d => d.parent === root ? 'middle' : 'start')
      // .style('fill-opacity', d => d.parent === root ? 1 : 0)
      .style('display', d => d.parent === root ? 'inline' : 'none')
      .each(function (d) {
        const sel = d3.select(this);
        if (!sel.attr('transform')) sel.attr('transform', `translate(${[d.x, d.y]})`);
      });
    label.addElems('text')
    .addElems('tspan', null, d => {
      let lines = (d.data.keyword || d.data.category || d.data.name).toString().split(/(?<![&/])\s/g);
      lines = lines.map((c, i) => {
        const obj = {};
        obj.y = 13 + (i - lines.length / 2) * 13;
        obj.text = c;
        obj.name = d.data.name;
        obj.category = d.parent === root;
        obj.r = d.r;
        return obj;
      });
      return lines;
    }).each(function (d) {
      const sel = d3.select(this);
      if (sel.text().length === 0) {
        /*
        This is for the first render. 
        It is needed to compute the background rectangles.
        Otherwise, the bbox is retrieved before the text is actually displayed, because of the transition().
        And the transition() is needed for later interaction.
        */
        sel.attr('x', d.category ? 0 : d.r)
          .attr('y', d.y)
          .attr('dy', '-.35em')
          .text(d => strings.capitalize.call(d.text));
      }
    }).transition()
      .attr('x', d => d.category ? 0 : d.r)
      .attr('y', d => d.y)
      .attr('dy', '-.35em')
      .style('fill', '#000')
      .style('fill-opacity', d => d.category ? 1 : 0)
      .text(d => strings.capitalize.call(d.text))
    label.each(function (d) {
      const sel = d3.select(this);
      sel.insertElems('text', 'rect', 'bg', _ => {
        const data = [...sel.selectAll('tspan').nodes()].map(c => {
          const { x, y, width: w, height: h } = c.getBBox();
          return { x, y, w, h, category: d.parent === root };
        });
        return data;
      }).transition()
        .attr('x', c => c.category ? d.r : -c.w/2)
        .attr('y', c => c.y)
        .attr('width', c => c.category ? c.w + 10 : c.w)
        .attr('height', c => c.h)
        .style('fill', c => c.category ? 'rgba(31,31,31,.9)' : 'rgba(255,255,255,.75)')
        .style('fill-opacity', 0);
    });
    label.transition()
      .attr('transform', d => `translate(${[d.x, d.y]})`)
      .style('text-anchor', d => d.parent === root ? 'middle' : 'start');
}