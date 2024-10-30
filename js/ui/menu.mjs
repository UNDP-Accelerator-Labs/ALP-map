export const menu = function (_kwargs) {
	let { regions, countries, tags } = _kwargs;
	// ADD THE mobilizations VALUES FOR NOW AS WE DO NOT ENABLE SELECTION YET
	const activeParams = new URLSearchParams(window.location);

	const cartouche = d3.select('.cartouche')
	const form = cartouche.select('form')

	form.addElems('input', 'mobilizations', activeParams.getAll('mobilizations'))
		.attrs({
			'type': 'hidden',
			'name': 'mobilizations',
			'value': d => d
		})

	// ADD THE DROPDOWNS
	regions.sort((a, b) => a.undp_region.localeCompare(b.undp_region))
	countries = countries.filter(d => {
		if (activeParams.getAll('regions').length) return d.has_lab && activeParams.getAll('regions').includes(d.undp_region)
		else return d.has_lab
	})

	tags.sort((a, b) => a.name?.localeCompare(b.name));
	
	// FOR FILTERING
	const regions_menu = cartouche.select('menu.f-regions')
	.addElems('li', 'region', regions)
	
	regions_menu.addElems('input')
		.attrs({
			'type': 'checkbox',
			'value': d => d.undp_region,
			'id': d => d.undp_region,
			'name': 'regions',
			'checked': d => activeParams.getAll('regions').includes(d.undp_region) || null
		})
	regions_menu.addElems('label')
		.attr('for', d => d.undp_region)
	.html(d => `${d.undp_region_name} (${d.undp_region})`)

	const countries_menu = cartouche.select('menu.f-countries')
	.addElems('li', 'country', countries)
	
	countries_menu.addElems('input')
		.attrs({
			'type': 'checkbox',
			'value': d => d.iso3,
			'id': d => d.iso3,
			'name': 'countries',
			'checked': d => activeParams.getAll('countries').includes(d.iso3) || null
		})
	countries_menu.addElems('label')
		.attr('for', d => d.iso3)
	.html(d => `${d.country}`)

	// FOR HIGHLIGHTING
	// const countries_hmenu = cartouche.select('menu.h-countries')
	// .addElems('li', 'country', countries)
	
	// countries_hmenu.addElems('input')
	// 	.attrs({
	// 		'type': 'checkbox',
	// 		'value': d => d.iso3,
	// 		'id': d => `h-${d.iso3}`,
	// 		'name': 'countries',
	// 		'checked': d => highlighttags_params.getAll('h-countries').includes(d.iso3) || null
	// 	})
	// countries_hmenu.addElems('label')
	// 	.attr('for', d => `h-${d.iso3}`)
	// .html(d => `${d.country}`)

	const tags_hmenu = cartouche.select('menu.h-tags')
	.addElems('li', 'tag', tags)
	
	tags_hmenu.addElems('input')
		.attrs({
			'type': 'checkbox',
			'value': d => d.name?.simplify(),
			'id': d => d.name?.simplify(),
			'name': 'h-tags',
			// 'checked': d => highlighttags_params.getAll('h-tag').includes(d.name?.simplify()) || null
		})
	.on('change', function (d) {
		toggleHighlight(d.name, this.checked)
	})

	tags_hmenu.addElems('label')
		.attr('for', d => d.name?.simplify())
	.html(d => d.name)

	// INTERACTIVITY
	cartouche.selectAll('.filter input[type=text]')
	.on('keyup', function () {
		const node = this
		const dropdown = d3.select(node).findAncestor('filter').select('.dropdown')
		dropdown.selectAll('menu li')
			.classed('hide', function () {
				return !this.textContent.trim().toLowerCase()
				.includes(node.value.trim().toLowerCase())
			})
	}).on('focus', function () {
		const dropdown = d3.select(this).findAncestor('filter').select('.dropdown')
		let { top, height } = this.getBoundingClientRect()
		top = top + height
		const viewheight = window.innerHeight
		if (top + 300 >= viewheight) dropdown.classed('dropup', true)

		const filters = d3.select(this).findAncestor('filters')

		if (dropdown.node()) dropdown.node().style.maxHeight = `${Math.min(dropdown.node().scrollHeight, 300)}px`
		if (filters?.node()) filters.node().style.overflow = 'visible'

		dropdown.selectAll('label, a').on('mousedown', function () {
			d3.event.preventDefault()
		})
	}).on('blur', function () {
		const filter = d3.select(this).findAncestor('filter')
		const dropdown = filter.select('.dropdown')
		if (dropdown.node()) dropdown.node().style.maxHeight = null
	})
}

function toggleHighlight (value, highlight = true) {
	d3.selectAll('circle')
	.filter(d => value?.length && Object.keys(d.data).includes('orid') && d.data.clean[0].includes(value))
	.classed('highlight', highlight)
}