import { d3, strings } from '../helpers/index.mjs';
import * as render from './index.mjs';

export const range_slider = function(steps, hierarchy, pads, kwargs) {
  let { width, height, svg, orient, canvas } = kwargs || {};
  if (!svg) {
    const panel = render.canvas('#interaction-panel');
    svg = panel.svg;
    width = panel.width;
    height = panel.height;
  }
  if (!orient) orient = 'horizontal';

  const radius = 10;
  const scale = d3.scaleLinear(
    d3.extent(steps), 
    [radius, orient === 'horizontal' ? width - radius : height - radius]
  );
  const min = Math.min(...scale.range());
  const max = Math.max(...scale.range());

  const drag = d3.drag()
  .on('drag', function (evt, d) {
    let rel_min = min;
    let rel_max = max;
    if (d.index === 0) {
      const { x, y } = svg.selectAll('.handle').filter(c => c.index === 1).datum();
      if (orient === 'horizontal') rel_max = x;
      else rel_max = y;
    } else if (d.index === 1) {
      const { x, y } = svg.selectAll('.handle').filter(c => c.index === 0).datum();
      if (orient === 'horizontal') rel_min = x;
      else rel_min = y;
    }
    if (orient === 'horizontal') {
      d.x += evt.dx;
      if (d.x <= rel_min) d.x = rel_min;
      if (d.x >= rel_max) d.x = rel_max;

      d3.select(this)
      .moveToFront()
        .attr('transform', `translate(${[d.x, d.y]})`);
      // Update line range
      if (d.index === 0) d3.select('line.range').attr('x1', d.x);
      else if (d.index === 1) d3.select('line.range').attr('x2', d.x);
    } else {
      d.y += evt.dy;
      if (d.y <= rel_min) d.y = rel_min;
      if (d.y >= rel_max) d.y = rel_max;

      d3.select(this)
      .moveToFront()
        .attr('transform', `translate(${[d.x, d.y]})`);
      // Update line range
      if (d.index === 0) d3.select('line.range').attr('y1', d.y);
      else if (d.index === 1) d3.select('line.range').attr('y2', d.y);
    }
  }).on('end', function (evt, d) {
    if (orient === 'horizontal') {
      d.value = Math.round(scale.invert(d.x + evt.dx));
      d.x = scale(d.value);
      
      d3.select(this)
      .transition()
        .attr('transform', `translate(${[d.x, d.y]})`);
      // Update line range
      if (d.index === 0) {
        d3.select('line.range')
        .each(c => c[0] = d.value)
        .transition()
          .attr('x1', d.x);
      }else if (d.index === 1) {
        d3.select('line.range')
        .each(c => c[1] = d.value)
        .transition()
          .attr('x2', d.x);
      }
    } else {
      d.value = Math.round(scale.invert(d.y + evt.dy));
      d.y = scale(d.value);
      
      d3.select(this)
      .transition()
        .attr('transform', `translate(${[d.x, d.y]})`);
      // Update line range
      if (d.index === 0) {
        d3.select('line.range')
        .each(c => c[0] = d.value)
        .transition()
          .attr('y1', d.y);
      } else if (d.index === 1) {
        d3.select('line.range')
        .each(c => c[1] = d.value)
        .transition()
          .attr('y2', d.y);
      }
    }
    /*
    Clear the cards and update the graphic
    */
    const card_list = d3.select('#card-list .inner');
    card_list.selectAll('.card').remove();
    card_list.select('.card-placeholder').classed('hide', false);
    card_list.node().scrollTo(0, 0);
    render.portfolio([]);
    render.bubbles(hierarchy, pads, { ...canvas });
  });

  const ticks = scale.ticks().filter(tick => Number.isInteger(tick));

  if (orient === 'horizontal') {
    svg.addElems('g', 'axis-bottom')
      .attr('transform', `translate(${[0, height/ 2]})`)
    .transition()
    .call(
      d3.axisBottom(scale)
        .tickValues(ticks)
        .tickFormat(d3.format('d'))
    ).selectAll('text')
      .attr('transform', `translate(${[0, radius*2]})`)
      .attr('fill', 'rgba(255,255,245,.5)')
      .attr('text-anchor', 'middle')
      .text(d => d);
  } else {
    svg.addElems('g', 'axis-right')
      .attr('transform', `translate(${[width/ 2, 0]})`)
    .transition()
    .call(
      d3.axisRight(scale)
        .tickValues(ticks)
        .tickFormat(d3.format('d'))
    ).selectAll('text')
      .attr('transform', `translate(${[radius*2, 0]})`)
      .attr('fill', 'rgba(255,255,245,.5)')
      .attr('text-anchor', 'start')
      .text(d => d);
  }

  const range_line = svg.addElems('line', 'range', [d3.extent(steps)])
    .attr('x1', d => orient === 'horizontal' ? scale(d[0]) : width/ 2)
    .attr('x2', d => orient === 'horizontal' ? scale(d[1]) : width/ 2)
    .attr('y1', d => orient === 'horizontal' ? height/ 2 : scale(d[0]))
    .attr('y2', d => orient === 'horizontal' ? height/ 2 : scale(d[1]))
    .attr('stroke', 'rgba(255,255,245,1)');

  const handle = svg.addElems('g', 'handle', d3.extent(steps).map((d, i) => { return { value: d, index: i } }))
    .attr('transform', d => {
      if (orient === 'horizontal') {
        d.x = scale(d.value);
        d.y = height/ 2;
      } else {
        d.x = width/ 2;
        d.y = scale(d.value);
      }
      return `translate(${[d.x, d.y]})`;
    }).call(drag)
  handle.addElems('circle')
    .attr('r', radius)
    .attr('fill', 'rgba(255,255,245,1)');
}

export const layer_activation = function (layer) {
  const button = d3.select('#layers')
    .addElems('div', `show-layer-btn ${strings.makeSafe.call(layer)}`);
  button.addElems('input')
    .attr('id', `show-${layer}`)
    .attr('type', 'checkbox')
  .each(function () {
    this.checked = true;
  }).on('change', function () {
    d3.select(`svg g.${layer}`)
      .classed('hide', !this.checked);
  });
  button.addElems('label')
    .attr('for', `show-${layer}`)
    .html(strings.capitalize.call(layer));
}