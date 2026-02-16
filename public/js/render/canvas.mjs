import { d3 } from '../helpers/index.mjs';

export const main = function (parentNode) {
  const {
    clientWidth: cw,
    clientHeight: ch,
    offsetWidth: ow,
    offsetHeight: oh,
  } = d3.select(parentNode).node() || document.body;
  const width = cw ?? ow;
  const height = ch ?? oh;

  const container = d3.select(parentNode || 'body');
  const svg = container.addElem('svg')
    .attr('x', 0)
    .attr('y', 0)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  return { width, height, svg };
}