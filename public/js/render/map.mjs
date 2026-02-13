import { d3 } from '../helpers/index.mjs';
import * as render from './index.mjs';

export const main = function (landmass, countries, kwargs) {
  const { width, height, svg, ctrs } = kwargs;
  if (!svg) {
    const canvas = render.canvas('#canvas');
    svg = canvas.svg;
    width = canvas.width;
    height = canvas.height;
  }

  // Convert the map data to geojson
  // const landtopo = topojson.feature(landmass, landmass.objects.landmass);
  let scale = 1;
  const countrytopo = topojson.feature(countries, countries.objects.all_countries);
  if (ctrs?.length > 0) {
    countrytopo.features = countrytopo.features.filter(d => ctrs.includes(d.id))
    scale = .8;
  }
  
  // const proj = d3.geoEquirectangular()
  const proj = d3.geoNaturalEarth1()
  .fitExtent([
    // [width * .1, 0],
    [width - (width * scale), height - (height * scale)],
    [width * scale, height * scale]
  ], countrytopo);

  const path = d3.geoPath(proj);
  
  // svg.addElems('g', 'basemap')
  // .addElems('path', null, landtopo.features)
  //   .attr('fill', 'rgba(55,55,55,.1)')
  // .transition()
  //   .attr('d', path);

  svg.addElems('g', 'countries', [countrytopo.features])
  .addElems('path', 'country', d => d)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(255,255,245,.15)')
  .transition()
    .attr('d', path);

  return { proj };
}