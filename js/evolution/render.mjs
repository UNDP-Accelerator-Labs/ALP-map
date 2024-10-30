import { setupSVG } from '../svg.mjs';
const p = 60;

export const render = function (lists) {
	const { svg, width: w, height: h } = setupSVG();
	const n = lists.length;
	const fsize = 12;
	const lheight = (h - p*2.5)/ Math.max(...lists.map(l => l.length));

	const g = svg.addElems('g', 'list', lists)
		.each(function (d, i) {
			d3.select(this).classed(`l-${i}`, true);
		}).attrs({
			'transform': (d, i) => `translate(${[ (i + 1) * w/(n + 1), p ]})`,
			'text-anchor': (d, i) => {
				if (i === 0) return 'end';
				else if (i === n -1) return 'start';
				else return 'middle';
			},
		});
	g.addElems('text', 'topic', d => d)
		.attrs({
			'font-size': `${fsize}px`,
			'y': (d, i) => i * lheight,
		}).addElems('tspan', null, d => { return [d.key, `(${d.padcount} activities/ ${d.countrycount} countries)`] })
		.attrs({
			'dy': (d, i) => i === 0 ? 0 : '1.2em',
			'x': 0,
			'fill-opacity': (d, i) => i !== 0 ? .5 : 1,
		}).text(d => d);

	// DRAW LINES BETWEEN TOPICS
	svg.selectAll('g.list:not(:last-child)')
	.each(function (d, i) {
		const sel = d3.select(this);
		const next = lists[i + 1];
		const middleCol = i !== 0 && i !== n - 1;
		const middleTarget = i + 1 !== n - 1;

		const lines = svg.addElem('g')
		.attr('transform', `translate(${[ (i + 1) * w/(n + 1), p ]})`)

		sel.selectAll('text')
		.each(function (c, j) {
			const sibling = next.findIndex(b => b.id === c.id);
			let ox = 0;
			let ow = 0;
			let tx = 0;

			if (middleCol) {
				const bbox = this.getBBox();
				ox = bbox.x;
				ow = bbox.width;
			}
			if (middleTarget) {
				const bbox = d3.select(`g.list.l-${i + 1}`).selectAll('text').filter((b, k) => k === sibling)?.node()?.getBBox() || {};
				tx = -(bbox.width ?? 0)/2;
			}


			if (sibling !== -1) {
				lines.addElem('line')
					.attrs({
						'x1': fsize + (ox + ow),
						'y1': j * lheight - fsize/4,
						'x2': w/(n + 1) - fsize + tx,
						'y2': sibling * lheight - fsize/4,
						'stroke': '#FFF',
					});
			}
		});
	});

}