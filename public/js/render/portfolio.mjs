import { d3 } from '../helpers/index.mjs';

export const main = function (tags) {
  const points = tags.map(d => {
    const circle = d3.selectAll('g.packs circle').filter(c => c.data?.tag_id === d);
    if (circle.node()) return [ circle.datum().x, circle.datum().y ]
    // if (circle.node()) return [circle.datum().parent.x, circle.datum().parent.y]
    else return null
  }).filter(d => d);

  d3.select('#canvas svg').addElems('path', 'portfolio', points.length ? [`M${sortpolygon(points).join(' L')}`] : [])
    .attr('d', d => d)
    // .style('stroke', 'rgb(98,187,70)')
    .style('stroke', 'rgba(170,170,180,1)')
    .style('stroke-width', 20)
    .style('stroke-linecap', 'round')
    .style('stroke-linejoin', 'round')
    .style('fill', 'none');
}

function sortpolygon (points, type) {
  if (!points.length) return points
  const unique = []
  points.forEach(d => {
    if (!unique.map(c => c.join('-')).includes(d.join('-'))) unique.push(d)
  });

  // INSPIRED BY https://stackoverflow.com/questions/14263284/create-non-intersecting-polygon-passing-through-all-given-points
  // FIND THE LEFT MOST POINT p AND TH RIGHT MOST POINT q
  const p = unique.sort((a, b) => a[0] - b[0])[0]
  const q = unique.sort((a, b) => b[0] - a[0])[0]
  // CONSIDERING THE FUNCTIONS THAT DEFINE THE pq SEGMENT IS
  // a * x + b
  const a = (p[1] - q[1]) / (p[0] - q[0])
  const b = p[1] - a * p[0]
  // FIND THE GROUP A OF POINTS ABOVE pq
  // A POINT (x, y) IS ABOVE pq IF y > ax + b
  // SEE https://math.stackexchange.com/questions/324589/detecting-whether-a-point-is-above-or-below-a-slope
  const A = unique.filter(d => d[1] > a * d[0] + b)
  A.sort((a, b) => a[0] - b[0])
  // AND THE GROUPP B OF POINTS BELOW pq
  const B = unique.filter(d => d[1] <= a * d[0] + b && ![p.join('-'), q.join('-')].includes(d.join('-')))
  B.sort((a, b) => b[0] - a[0])

  let sorted = [p]
  sorted = sorted.concat(A)
  sorted.push(q)
  sorted = sorted.concat(B)

  return sorted
}