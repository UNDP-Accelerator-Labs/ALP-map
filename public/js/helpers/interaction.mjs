import { d3 } from './index.mjs';
import * as render from '../render/index.mjs';

export const filterYear = function (data, years) {
  let { nodes, links } = data || {};
  // This is for filtering by year
  links = links.filter(d => {
    if (Array.isArray(years)) {
      return +new Date(d.year).getFullYear() >= Math.min(...years) && +new Date(d.year).getFullYear() <= Math.max(...years);
    } else return +new Date(d.year).getFullYear() === +years;
  });
  const linked_nodes = [...new Set(links.map(d => [d.source.name, d.target.name]).flat())];
  nodes = nodes.filter(d => linked_nodes.includes(d.name));
  return { nodes, links };
}

export const slider = function (nodes, links, kwargs) {
  const slider = d3.select("#timescale");

  // Update the current slider value (each time you drag the slider handle)
  slider.on("input", function () {
    const { nodes: filtered_nodes, links: filtered_links } = filterYear(nodes, links, this.value);
    render.bars(filtered_nodes, kwargs);
    render.ecosystems(filtered_nodes, filtered_links, kwargs);
  });
}