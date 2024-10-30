import { token } from './token.mjs';
import { addLoader, rmLoader } from '../ui/index.mjs';
import { baseurl } from '../utils/index.mjs';

export const loadData = async function (taxonomy, _kwargs, include_location_information) {
	if (!taxonomy) taxonomy = '/data/taxonomy_latest.json';

	const tags = new URL('apis/fetch/tags', baseurl);
	const pads = new URL('apis/fetch/pads', baseurl);

	const params = new URLSearchParams();
	params.append('token', token);
	params.append('output', 'json');
	params.append('include_tags', true);
	params.append('space', 'published');
	
	if (_kwargs) {
		for (let k in _kwargs) {
			if (k === 'pinboard') params.append('space', 'pinned');
			const v = _kwargs[k];
			if (Array.isArray(v)) {
				v.forEach(d => {
					params.append(k, d);
				})
			} else params.append(k, v);
		}
	} 

	const search = new URLSearchParams(window.location.search);
	search.forEach((v, k) => {
		if (['countries'].includes(k)) params.append(k, v);
		if (['regions'].includes(k)) params.append(k, v);
		if (['mobilizations'].includes(k)) params.append(k, v);
		if (['pads'].includes(k)) params.append(k, v);
		if (['pinboard'].includes(k)) {
			params.append(k, v);
			params.append('space', 'pinned');
		}
	});

	const promises = [];

	promises.push(GET(`${tags.origin}${tags.pathname}?${params.toString()}`));
	promises.push(GET(`${pads.origin}${pads.pathname}?${params.toString()}`));
	promises.push(d3.json(taxonomy));

	if (include_location_information) {
		const regions = new URL('apis/fetch/regions', baseurl);
		const countries = new URL('apis/fetch/countries', baseurl);

		const location_params = new URLSearchParams();
		location_params.append('token', token)
		location_params.append('has_lab', true)

		promises.push(GET(`${regions.origin}${regions.pathname}?${location_params.toString()}`))
		promises.push(GET(`${countries.origin}${countries.pathname}?${location_params.toString()}`))
	}

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