export const getSVG = function () {
	return d3.select('svg#canvas');
}
export const setupSVG = function () {
	const { clientWidth: cw, clientHeight: ch, offsetWidth: ow, offsetHeight: oh } = d3.select('.left-col').node();
	const width = Math.round(Math.min(cw ?? ow, ch ?? oh));
	const height = width;
	
	const svg = getSVG();

	if (!svg.classed('setup')) {
		svg.classed('setup', true)
		.attrs({ 
			'x': 0,
			'y':0,
			'viewBox': `0 0 ${width} ${height}`,
			'preserveAspectRatio': 'xMidYMid meet'
		}).append('g');
	}
	return { svg, width, height };
}