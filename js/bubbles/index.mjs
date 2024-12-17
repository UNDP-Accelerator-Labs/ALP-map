import { loadData, processData, getCounts } from '../data/index.mjs';
import { processPack } from './process.mjs';
import { render } from './render.mjs';
import { menu as renderMenu } from '../ui/index.mjs';
import { islocal } from '../utils/index.mjs';

async function onLoad () {
	if (!islocal) d3.select('#get-data').remove();
	else {
		d3.select('#get-data')
		.on('click', _ => {
			const newdata = d3.selectAll('.node').data().filter(d => !d.children).map(d => d.data);
			taxonomy.forEach(d => {
				const source = newdata.find(c => c.selfId === d.selfId);
				if (source && d.clusters !== source.clusters) {
					d.clusters = source.clusters;
					d.keywords = source.keywords;
				}
			});
			console.log(taxonomy);
		});
	}

	// LOAD DATA AND DRAW PACKS
	// hidepacks: [130, 118]
	const params = new URLSearchParams(window.location.search);
	const qm = params.get('mobilizations');
	let options = {};
	if (!qm) options.mobilizations = [38, 37];

	const data = await loadData('../../data/taxonomy_latest.json', options, true);
	let { taxonomy } = processData(data, [-1]);
	
	const packs = processPack(taxonomy);
	render({ packs, pads: data[1].flat() });

	const [ regions, countries ] = data.slice(-2);
	const tags = data[0];
	renderMenu({ regions, countries, tags });

	// ADD BASIC INTERACTION
	d3.select('button.expand-filters')
	.on('click', function () {
		d3.select(this).toggleClass('close')
		const cartouche = d3.select(this).findAncestor('cartouche')
		const filters = cartouche.select('form').node()
		const padding = filters.querySelector('section').getBoundingClientRect().height / 2
		// WE NEED TO MANUALLY ADD THE BOTTOM PADDING BECAUSE IT IS NOT COMPUTED IN THE scrollHeight
		if (filters.style.maxHeight) {
			filters.style.maxHeight = null
			filters.style.overflow = 'hidden'
		} else {
			filters.style.maxHeight = `${filters.scrollHeight + padding}px`
			filters.style.overflow = 'visible'
		}
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', onLoad);
} else {
	(async () => { await onLoad() })();
}