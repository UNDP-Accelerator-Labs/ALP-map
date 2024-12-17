import { setupSVG, getSVG } from '../svg.mjs';
import { displaySnippets } from '../ui/pannel.mjs';
import { islocal } from '../utils/index.mjs';

const p = 60;

const color = d3.scaleSequential(d3.interpolateMagma)
	.domain([-3, 3])

const stratify = d3.stratify()
	.parentId(d => d.id.substring(0, d.id.lastIndexOf('.')))

export const render = function (_kwargs) {
	const { packs, pads: allpads } = _kwargs;
	const { svg, width: w, height: h } = setupSVG();

	const drag = d3.drag()
	.on('start', function (d) {
		const sel = d3.select(this)
		d.mx = d.x
		d.my = d.y
		sel.style('pointer-events', 'none')
		.selectAll('text')
		.classed('hide', true)
	}).on('drag', function (d) {
		const evt = d3.event
		const sel = d3.select(this)
		d.mx += evt.dx
		d.my += evt.dy
		sel.attr('transform', `translate(${d.mx},${d.my})`)
	}).on('end', function (d) {
		const evt = d3.event
		const { depth: target_depth, id: target_id, children } = evt.sourceEvent.target['__data__'] || d3.select(evt.sourceEvent.target).findAncestor('node')?.datum() || {}
		const sel = d3.select(this)
		
		if (!target_depth || target_depth < d.depth - 1) {
			sel.transition().attr('transform', `translate(${d.x},${d.y})`)
		} else {
			d.x = d.mx
			d.y = d.my
			d.data.id = `${target_id}.${d.id.substring(d.id.lastIndexOf('.') + 1).split(/(?=[A-Z][^A-Z])/g)[0]}`
			d.data.clusters = children.map(d => d.data).unique('clusters', true)[0]
			d.data.keywords = children.map(d => d.data).unique('keywords', true)[0]
		}
		sel.style('pointer-events', null)
		render({ packs: d3.selectAll('.node').data().map(d => d.data), pads: allpads });
	});

	const pack = d3.pack()
		.size([ w - p * 2, h - p * 2])
		.padding(20);

	const root = stratify(packs)
		.sum(d => d.value)
		.sort((a, b) => b.value - a.value);

	pack(root)
	const min_depth = Math.min(...root.descendants().unique('depth', true));
	const max_depth = Math.max(...root.descendants().unique('depth', true));

	const acclab_colors = d3.scaleOrdinal()
		.domain(root.descendants().unique('depth', true))
		.range(['#005687', '#0468B1', '#32BEE1']);

	let node = svg.select('g')
		.selectAll('g')
	.data(root.descendants(), d => d.id);
	node.exit().remove();
	
	node = node.enter().append('g')
		.attrs({
			'class': d => `node${(!d.children ? ' node--leaf' : d.depth ? '' : ' node--root')}`,
			'transform': d => `translate(${(w - p * 2) / 2},${(h - p * 2) / 2})`
		})
	.each(function(d) { 
		const sel = d3.select(this)
		d.node = this 
		if (sel.classed('node--leaf') && islocal) sel.call(drag)
	}).on('mouseover', function (d) {
		const sel = d3.select(this)
		if (sel.classed('node--leaf')) {
			sel.moveToFront()
			d3.selectAll('.group-label')
				.filter(c => d.parent.data.id === c.data.id)
			.selectAll('tspan')
				.transition()
				.style('opacity', 0)

			d3.selectAll('.node')
				.classed('hover', c => d.parent.data.id === c.data.id)
		}
		sel.selectAll('text')
			.classed('hide', false)
			.style('opacity', 1)
		// hovered(true)
	}).on('mouseout', function (d) {
		const sel = d3.select(this)
		if (sel.classed('node--leaf')) {
			d3.selectAll('.group-label tspan')
			.transition().style('opacity', 1)

			d3.selectAll('.node.hover')
				.classed('hover', false)
		}
		sel.selectAll('text')
			.classed('hide', true)
			.style('opacity', 0)
		// hovered(false)
	}).on('click', async function (d) {
		const sel = d3.select(this)
		if (d.children && d.depth !== 0) {
			// HIGHLIGHT
			d3.selectAll('circle.highlight').classed('highlight', false);
			const circle = sel.select('circle').classed('highlight', true);
			
			// GET DATA
			const tag_ids = d.children.map(c => c.data.orid).flat();
			const cluster_name = d.children.map(c => c.data).flat().unique('keywords', true);

			const pads = allpads.filter(c => {
				return c.tags?.some(b => {
					return b.type === 'thematic_areas' && tag_ids.includes(b.tag_id);
				});
			});

			displaySnippets({ title: cluster_name, data: pads });
		} else if (sel.classed('node--leaf')) {
			const parent = d3.selectAll('.node')
			.filter(c => d.parent.data.id === c.data.id)
			.node().dispatchEvent(new Event('click'))
		}
	}).merge(node);
	
	node.transition()
		.duration(_ => 1000 + Math.random() * 2000)
		.delay(_ => Math.random() * 1000)
		.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);

	let circle = node.selectAll('circle')
		.data(d => [d]);
	circle.exit().remove();
	
	circle = circle.enter().append('circle')
		.attrs({
			'id': d => `node-${d.id}`,
			'r': 5
		}).style('fill', d => {
			if (d.data.highlight) return '#FFC10E'
			else if (d.children) return 'transparent'
			else return acclab_colors(d.depth)
		})
	.merge(circle);

	circle.transition()
		.duration(3000)
		.attr('r', d => d.r || 5);

	const leaf = node.filter(d => !d.children)
	let leaf_text = leaf.selectAll('text')
		.data(d => [d])
	leaf_text.exit().remove();

	leaf_text = leaf_text.enter()
		.append('text')
		.attrs({ 
			'class': 'leaf-label hide',
			'x': 0,
			'y': (d, i, nodes) => (i - nodes.length / 2 - 0.5) * 14
		}).styles({
			'opacity': 0,
			'pointer-events': 'none'
		}).text(d => d.id.substring(d.id.lastIndexOf('.') + 1).split(/(?=[A-Z][^A-Z])/g))

	let group_text = svg.selectAll('text.group-label')
		.data(root.descendants().filter(d => d.depth === max_depth - 1), d => `label-${d.id}`)
	group_text.exit().remove();

	group_text = group_text.enter()
		.append('text')
		.attrs({ 
			'class': 'group-label',
			'x': 0,
			'transform': d => `translate(${d.x || 0},${d.y || 0})`,
		}).styles({
			'font-family': '"Noto Sans", Helvetica, Arial, sans-serif',
			'font-size': '14px',
			'text-anchor': 'middle',
			'text-transform': 'capitalize',
			'pointer-events': 'none',
			'fill': '#FFF',
			'opacity': 0
		})
		.merge(group_text);
	
	group_text.transition()
		.delay(_ => 2000 + Math.random() * 1000)
		.duration(_ => Math.random() * 1000)
		.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`)
		.style('opacity', .75);

	let text_lines = group_text.selectAll('tspan')
		.data(d => {
			if (d.children?.length === 1) return []
			else return d.id.substring(d.id.lastIndexOf('.') + 1).split(/(?=[A-Z][^A-Z])/g)[0].split('-')
		})
	text_lines.exit().remove();

	text_lines = text_lines.enter()
		.append('tspan')
		.attrs({ 
			'x': 0,
			'y': (d, i, nodes) => 13 + (i - nodes.length / 2 - 0.5) * 16,
		}).text(d => d)
	.merge(text_lines);

	// function hovered(hover) {
	// 	return function(d) {
	// 		d3.selectAll(d.ancestors().map(function(d) { return d.node; })).classed('node--hover', hover);
	// 	};
	// }

	d3.selectAll('.group-label').moveToFront()
}

export const drawPortfolio = function (data) {
	const points = data.map(d => {
		const circle = d3.selectAll('g.node--leaf').filter(c => c.data.orid.includes(d))
		if (circle.node()) return [ circle.datum().x, circle.datum().y ]
		else return null
	}).filter(d => d);

	getSVG()
	.addElems('path', 'portfolio', [sortpolygon(points)])
		.attrs({
			'd': d => `M${d.join(' L')}`
		}).styles({
			'stroke': '#FFF',
			'fill': 'none',
		});
}

function sortpolygon (points, type) {
	if (!points.length) return points
	const unique = []
	points.forEach(d => {
		if (!unique.map(c => c.join('-')).includes(d.join('-'))) unique.push(d)
	})

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