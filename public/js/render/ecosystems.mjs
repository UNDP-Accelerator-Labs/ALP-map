import { d3, strings, arrays } from '../helpers/index.mjs';
import * as render from './index.mjs';
import { colors } from './settings.mjs';

export const main = function (data, kwargs) {
  let { nodes, links } = data || {};
  let { width, height, svg, ctrs, countries } = kwargs || {};
  if (!svg) {
    const canvas = render.canvas('#canvas');
    svg = canvas.svg;
    width = canvas.width;
    height = canvas.height;
  }
  if (!countries) countries = {};
  /*
  If zooming into a specific country
  */
  if (ctrs?.length !== 0) {
    links = links.filter(d => ctrs.includes(d.iso3));
    nodes = nodes.filter(d => links.some(c => c.source === d.name || c.target === d.name));
    countries.objects.all_countries.geometries = countries.objects.all_countries.geometries.filter(d => ctrs.includes(d.id));
    const linked_nodes = [...new Set(links.map(d => [d.source, d.target]).flat())];
    nodes = nodes.filter(d => linked_nodes.includes(d.name));
  }

  // console.log(nodes.filter(d => d.type !== 'Accelerator Lab').length)
  // console.log(arrays.nest.call(nodes.filter(d => d.type !== 'Accelerator Lab'), { key: 'type' }))
  
  /* 
  Filter according to the selected time range
  */
  const date_range = d3.selectAll('#interaction-panel g.handle').data().map(d => d.value);
  links = links.filter(d => {
    return +new Date(d.year).getFullYear() >= Math.min(...date_range) 
    && +new Date(d.year).getFullYear() <= Math.max(...date_range);
  });
  const linked_nodes = [...new Set(links.map(d => [d.source?.name ? d.source.name : d.source, d.target?.name ? d.target.name : d.target]).flat())];
  nodes = nodes.filter(d => linked_nodes.includes(d.name));

  const actor_types = [...new Set(nodes.map(d => d.type))];

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.name))
    .force('charge', d3.forceManyBody().strength(ctrs?.length ? -300 : -15))
    .force('x', d3.forceX())
    .force('y', d3.forceY());

  const g = svg.addElems('g', 'ecosystems')
    .attr('transform', `translate(${[width/ 2, height/ 2]})`);

  const link = g.addElems('g', 'lines', [links])
  .addElems('line', 'line', d => d)
    .attr('stroke', 'rgba(255,255,245,.15)')
    .attr('stroke-width', d => d.count);

  const node = g.addElems('g', 'nodes', [nodes])
    .addElems('g', 'node', d => d, d => d.name);
  node.each(function (d) {
    const sel = d3.select(this);

    if (ctrs.length && d.type.toLowerCase() === 'accelerator lab' && false) {
      sel.addElems('rect', 'logo-1x', [0])
        .attr('width', 13)
        .attr('height', 13)
        .attr('x', -7)
        .attr('y', -14)
        .attr('fill', colors[d.type])
        .attr('fill-opacity', .75);
      sel.addElems('rect', 'logo-4x', new Array(4).fill(0))
        .attr('width', 6)
        .attr('height', 6)
        .attr('x', (c, j) => (j % 2) * 7 - 7)
        .attr('y', (c, j) => Math.floor(j/ 2) * 7)
        .attr('fill', colors[d.type])
        .attr('fill-opacity', .75);
    } else {
      sel.addElems('rect')
        .attr('width', ctrs?.length ? 8 : 6)
        .attr('height', ctrs?.length ? 8 : 6)
        .attr('x', -3)
        .attr('y', -3)
        .attr('fill', colors[d.type])
      .on('mouseover', function (evt, d) {
        const { name, type, description } = d || {};
        const context_links = arrays.nest.call(links.filter(c => c.target.name == d.name), { key: d => d.source.fullname, keep: 'description' }).map(d => [d.key, d.description]);
        // const context_links = arrays.nest.call(links.filter(c => [c.source.name, c.target.name].includes(d.name)), { key: d => d.source.fullname, keep: 'description' }).map(d => [d.key, d.description]);

        if (type.toLowerCase() !== 'accelerator lab') {
          sel.moveToFront();
          d3.select(this)
            .transition()
            .duration(100)
            .attr('transform', 'scale(3)');

          const cartouche = d3.select('#cartouche')
            .each(function () {
              this.classList = '';
            }).classed(strings.makeSafe.call(type), true);
          cartouche.select('#partner-type').html(strings.capitalize.call(type));
          cartouche.select('#partner-name').html(name);
          cartouche.select('#partner-description')
          .each(function () {
            const sel = d3.select(this);
            sel.select(".interaction-queue").remove()
            const descriptions = sel.addElems('div', 'description', context_links)
            descriptions.addElems('h3', 'source', c => [c[0]])
              .html(c => c?.trim());
            descriptions.addElems('p', null, c => c[1])
              .html(c => c?.trim());
          });
          // <h2 id="partner-name">Partner</h2>
          // <p id="partner-description">Description</p>
          // <a id="partner-source">Source</a>
        }
      }).on('mouseout', function () {
        d3.select(this)
          .transition()
          .attr('transform', null);
      });
    }
  });

  simulation.on('tick', () => {
    link.attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.attr('transform', d => `translate(${[d.x, d.y]})`);
   });

  // console.log(links.find(d => d.link?.name === 'TELECEL' || d.target?.name === 'TELECEL'));
  render.bars(nodes, { ...kwargs });
}