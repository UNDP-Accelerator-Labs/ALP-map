import { drawPortfolio } from '../bubbles/render.mjs';
import { baseurl } from '../utils/index.mjs';

export const clearPanel = function () {
	const container = d3.select('.right-col')
		.style('flex', '0 1 0');
	d3.select(this).remove();
	container.selectAll('.inner').remove();
	// UNHIGHLIGHT ALL SELECTED NODES
	d3.selectAll('g.node circle.highlight').classed('highlight', false);
}

export const displaySnippets = function (_kwargs) {
	const { title, data, timeseries } = _kwargs;
	
	const container = d3.select('.right-col')
		.style('flex', '1 1 0');


	container.addElems('button', 'expand-filters fixed close')
		.on('click', clearPanel)
	.addElems('div', 'line', new Array(3).fill(0).map((d, i) => i + 1))
	.each(function (d) {
		d3.select(this).classed(`l${d}`, true);
	});

	const panel = container.addElems('div', 'inner');

	panel.addElems('h1', 'category', title ? [title] : [])
		.html(d => d);

	// drawTimeSeries(timeseries)

	const pad = panel.addElems('article', 'pad', data)
	.on('mouseover', function (d) {
		const tags = d.tags.filter(c => c.type === 'thematic_areas')
		const tag_ids = tags.map(c => c.tag_id)
		// DIM ALL NODES THAT ARE NOT IN THE PAD
		d3.selectAll('g.node--leaf circle')
		.filter(c => c.data.orid.intersection(tag_ids).length === 0)
		.classed('dimmed', true)

		d3.selectAll('.group-label')
		.classed('hide', true)

		d3.selectAll('.leaf-label')
		.classed('hide', c => c.data.orid.intersection(tag_ids).length === 0)

		drawPortfolio(tag_ids)
	}).on('mouseout', _ => {
		// UNDIM ALL NODES
		d3.selectAll('g.node--leaf circle')
		.classed('dimmed', false)

		d3.selectAll('.group-label')
		.classed('hide', false)

		d3.selectAll('.leaf-label')
		.classed('hide', true)

		d3.selectAll('path.portfolio').remove()
	}).addElems('div', 'inner')

	const head = pad.addElems('hgroup', 'head')

	head.addElems('h1', 'title')
		.addElems('a')
	.attrs({
		'href': d => new URL(`en/view/pad?id=${d.pad_id}`, baseurl),
		'target': '_blank'
	}).html(d => d.title)
	head.addElems('p', 'country')
		.html(d => d.country)
	head.addElems('small', 'date')
		.html(d => {
			const date = new Date(d.created_at)
			const year = date.getFullYear()
			let month = date.getMonth() + 1
			if (month < 10) month = `0${month}`
			return `${year}-${month}`
		})
	head.addElems('div', 'tags', d => [d.tags.filter(c => c.type === 'thematic_areas')])
		.addElems('div', 'tag', d => d)
		.html(d => d.name?.length > 20 ? `${d.name?.slice(0, 20)}...` : d.name)

	const body = pad.addElems('div', 'body')
	body.addElems('img', 'vignette', d => d.vignette ? [d.vignette] : [])
		.attr('src', d => d?.replace('https:/', 'https://'));
	body.addElems('p', 'snippet', d => [d.snippet])
		.html(d => d);
}