const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNDVlMThiYzMtODgwNS00NWUxLThjNTQtYjM1NmJjZWU0OTEyIiwicmlnaHRzIjozLCJpYXQiOjE2OTk3MDQwOTksImF1ZCI6InVzZXI6a25vd24iLCJpc3MiOiJzZGctaW5ub3ZhdGlvbi1jb21tb25zLm9yZyJ9.vKYu1PcT5Z672GUOuxO4ux_E6MTd2PT-GPBgXPgXbl8';
const local = false;

async function loadData () {
	const search = new URLSearchParams(window.location.search);
	let platform = search.get('platform');
	let taxonomy = search.get('taxonomy');

	if (!platform) platform = 'learningplans';
	if (!taxonomy) taxonomy = '../../data/taxonomy_latest.json';

	const baseurl = new URL(`https://${platform}.sdg-innovation-commons.org`);
	const tags = new URL('apis/fetch/tags', baseurl);
	const pads = new URL('apis/fetch/pads', baseurl);

	const params = new URLSearchParams();
	params.append('token', token);
	params.append('output', 'json');
	params.append('include_tags', true);
	
	search.forEach((v, k) => {
		if (['countries'].includes(k)) params.append(k, v);
		if (['regions'].includes(k)) params.append(k, v);
		if (['mobilizations'].includes(k)) params.append(k, v);
		if (['pads'].includes(k)) params.append(k, v);
		if (['pinboard'].includes(k)) {
			params.append(k, v);
			params.append('space', 'pinned');
		}
	})

	const promises = [];
	if (!local) {
		promises.push(GET(`${tags.origin}${tags.pathname}?${params.toString()}`));
		promises.push(GET(`${pads.origin}${pads.pathname}?${params.toString()}`));
	} else {
		promises.push([])
		promises.push([])
	}
	promises.push(d3.json(taxonomy))

	console.log('loading')
	console.log(`${tags.origin}${tags.pathname}?${params.toString()}`)
	console.log(`${tags.origin}${pads.pathname}?${params.toString()}`)
	console.log('\n')

	addLoader();
	const data = Promise.all(promises)
	.catch(err => console.log(err));
	rmLoader();
	return data;
}

function processData (data) {
	// PRE-PROCESS
	let [ sourcetags, pads, taxonomy ] = data;
	pads = pads.flat();

	const usedtags = pads.map(d => {
		return d.tags.filter(c => c.type === 'thematic_areas').map(c => c.tag_id)
	}).flat().unique();
	const tags = sourcetags.filter(d => {
		return usedtags.includes(d.id)
	});

	let idsInTaxonomy = taxonomy.map(d => d.id).flat().unique();
	let missingTags = tags.filter(d => !idsInTaxonomy.includes(d.id));

	if (missingTags.length) {
		console.log('some ids are missing in the taxonomy')
		console.log(missingTags)

		missingTags.forEach(d => {
			const { id, name: clean } = d;
			const newTaxon = new taxon({ id, clean });
			taxonomy.push(newTaxon);
		});
	}

	if (usedtags.length) taxonomy = taxonomy.filter(d => d.id.some(c => usedtags.includes(c)));
	// THERE MIGHT BE AN ISSUE HERE
	taxonomy.forEach((d, i) => {
		d.selfId = i;
		if (d.clusters === -1) d.keywords = 'Uncategorized';
	});

	return [ tags, pads, taxonomy ];
}

function render (data) {
	let [ tags, pads, taxonomy ] = data;
	console.log(tags)
	console.log(taxonomy)
	// if (tags?.length) taxonomy = taxonomy.filter(d => d.id.some(c => tags?.some(b => b.id = c)));

	const structure = taxonomy.nest('clusters', 'keywords');

	const categories = d3.select('.layout .col-1')
	.addElems('ul', null, [ structure.sort((a, b) => a.keywords.localeCompare(b.keywords)) ])
	.addElems('li', 'category-name', d => d, d => d.key)
	.on('click', function (d) {
		const col2 = d3.select('.col-2')
		const target = col2.selectAll('li.category')
			.filter(c => c.key === d.key);
		const parent = target.node().parentNode;
		target.classed('highlight', true)
			//.node().click();
		col2.node().scrollTo({
			top: target.node().offsetTop - parent.offsetTop,
			left: 0,
			behavior: 'smooth',
		});
		setTimeout(_ => target.classed('highlight', false), 2000);
	})
	categories.addElems('input')
	.attrs({
		'type': 'text',
		'disabled': true,
		'value': d => `${d.keywords} (${d.count})`,
	});
	categories.addElems('button', 'edit')
	.on('click', function (d) {
		d3.event.stopPropagation();
		const sel = d3.select(this);
		sel.toggleClass('editing');
		const input = this.previousSibling;
		if (sel.classed('editing')) {
			input.disabled = false;
			sel.html('Save');
			input.value = d.keywords;
		} else {
			input.disabled = true;
			const { value } = input;
			input.value = `${value} (${d.count})`
			sel.html('Edit');
			// RE-RENDER
			taxonomy.forEach(c => {
				if (c.clusters === d.key) c.keywords = value;
			});
			render([ tags, pads, taxonomy ]);
		}
	}).html('Edit');
	categories.addElems('button', 'view')
	.html('View');

	const classified = d3.select('.layout .col-2')
	.addElems('ul', null, [ structure.filter(d => d.key !== -1).sort((a, b) => b.count - a.count) ])
	.addElems('li', 'category', d => d, d => d.key)
		.html(d => `${d.keywords} (${d.count})`)
	.addElems('ul', null, d => [ d.values.sort((a, b) => a.split.localeCompare(b.split)) ], d => d[0].clusters)
	.addElems('li', 'tag', d => d, d => d.split)
		.html(d => d.split)

	const unclassified = d3.select('.layout .col-3')
	.addElems('ul', null, [ structure.filter(d => d.key === -1) ])
	.addElems('li', 'category', d => d, d => d.key)
		.html(d => `${d.keywords} (${d.count})`)
	.addElems('ul', null, d => [ d.values.sort((a, b) => a.split.localeCompare(b.split)) ], d => d[0].clusters)
	.addElems('li', 'tag', d => d, d => d.split)
		.html(d => d.split);

	// MAKE SURE THERE IS CONTINUITY IN OPEN CATEGORIES
	d3.selectAll('li.category.open')
	.each(function () {
		const sel = d3.select(this);
		if (sel.classed('open')) {
			const panel = sel.select('ul').node();
			panel.style.maxHeight = `${panel.scrollHeight}px`;
		}
	})
	// MAKE SURE THERE IS CONTINUITY IN VISIBLE TAGS
	d3.selectAll('li.tag')
	.classed('hide', function () {
		const search = d3.select('.search').node();
		console.log(this.textContent.trim().toLowerCase(), search.value.trim().toLowerCase(), this.textContent.trim().toLowerCase().includes(search.value.trim().toLowerCase()))
		return !this.textContent
		.trim()
		.toLowerCase()
		.includes(search.value.trim().toLowerCase());
	});

	d3.selectAll('li.category')
	.on('click', function () {
		const node = this;
		const sel = d3.select(this);
		sel.toggleClass('open');
		d3.selectAll('li.category')
			.filter(function () { return this !== node })
			.classed('open', false);
		d3.selectAll('li.category ul').style('max-height', null);
		if (sel.classed('open')) {
			const panel = sel.select('ul').node();
			panel.style.maxHeight = `${panel.scrollHeight}px`;
		}
	});

	d3.selectAll('li.tag')
	.on('click', function (d) {
		d3.event.stopPropagation();
		d3.selectAll('select').remove();
		const sel = d3.select(this);
		sel.addElems('select', null, [ structure ])
			.on('click', _ => d3.event.stopPropagation())
			.on('change', function (c) {
				const name = c.find(b => b.key === +this.value)?.keywords;
				taxonomy.forEach(b => {
					if (b.selfId === d.selfId) {
						b.clusters = +this.value;
						b.keywords = name;
					}
				});
				render([ tags, pads, taxonomy ]);
			})
		.addElems('option', null, c => c)
		.each(function (c) {
			this.selected = c.key === d.clusters;
		}).attr('value', c => c.key)
			.html(c => `${c.keywords} (${c.count})`);

		const panel = d3.select(this.parentNode).node();
		panel.style.maxHeight = `${panel.scrollHeight}px`;
	});

	// SEARCH FUNCTION
	d3.select('.search')
	.on('keyup', function () {
		const node = this;
		d3.selectAll('li.tag')
		.classed('hide', function () {
			return !this.textContent
			.trim()
			.toLowerCase()
			.includes(node.value.trim().toLowerCase());
		});
		d3.selectAll('li.category')
		.classed('hide', function () {
			return d3.select(this).selectAll('li.tag:not(.hide)').size() === 0;
		});
	})

	d3.select('.download')
	.on('click', _ => {
		download('taxonomy_latest.json', JSON.stringify(taxonomy));
	});
	return;	
}

async function onLoad () {
	const data = await loadData();
	render(processData(data));
	return;
}

function addLoader () {
	const ripple = d3.select('body').addElems('div', 'lds-default');
	ripple.addElems('div', 'filler', d3.range(12));
}
function rmLoader () {
	d3.select('.lds-default').remove();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', onLoad);
} else {
	(async () => { await onLoad() })();
}