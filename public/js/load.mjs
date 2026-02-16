import * as render from './render/index.mjs';
import { d3, arrays, parsers } from './helpers/index.mjs';
import { token } from './tokens.mjs';

const local = true;
const use_token = true;

async function onLoad() {
  /*
  Get the data
  */
  const taxonomy = await d3.csv('public/data/taxonomy.csv')
  .then(res => {
    res.forEach(d => d.id = +d.id);
    return res;
  }).catch(err => console.log(err));


  console.log(taxonomy)
  let pads = [];
  if (local) {
    pads = await d3.json('public/data/local_data.json')
    .catch(err => console.log(err));

    const q_params = new URL(window.location).searchParams;
    let ctrs = q_params.getAll('ctr') || q_params.getAll('CTR');
    if (!Array.isArray(ctrs)) ctrs = [ctrs];

    console.log(pads)

    if (ctrs.length) {
      pads = pads.filter(d => ctrs.includes(d.iso3))
    }
  } else {
    const pads_path = new URL('api/pads', new URL('https://www.sdg-innovation-commons.org'));
    // const mobilization = [65, 79, 82, 67, 75, 76, 86, 87, 90, 92, 93];
    const templates = [403];

    const pads_queryparams = new URLSearchParams(pads_path.search);
    pads_queryparams.append('output', 'json');
    if (use_token) pads_queryparams.append('token', token);
    pads_queryparams.append('include_imgs', true);
    pads_queryparams.append('include_tags', true);
    pads_queryparams.append('include_source', true);
    pads_queryparams.append('platform', 'action plan');
    pads_queryparams.append('status', 2);
    pads_queryparams.append('status', 3);

    new URLSearchParams(window.location.search).forEach((v, k) => {
      if (['countries', 'ctr', 'CTR'].includes(k)) {
        pads_queryparams.append('countries', v);
        // f_countries.push(v);
      }
      if (['regions'].includes(k)) {
        pads_queryparams.append(k, v);
        // f_regions.push(v);
      }
      if (['templates'].includes(k)) pads_queryparams.append(k, v);
    })
    if (!pads_queryparams.has('templates')) {
      if (!Array.isArray(templates)) templates = [templates];
      templates.forEach(d => pads_queryparams.append('templates', d));
    }

    const { count, data } = await fetch(`${pads_path}?${pads_queryparams}`)
    .then(res => res.json())
    .catch(err => console.log(err));
    pads = data;
  }

  /*
  Get timescales
  */
  const dates = pads.map(d => {
    const { created_at: date } = d || {};
    return new Date(date).getFullYear();
  });
  const range = d3.extent(dates);
  const steps = new Array((range[1] - range[0]) + 1).fill(0).map((d, i) => range[0] + i);

  /*
  Render everything
  */
  const canvas = render.canvas('#canvas');
  render.widgets.range_slider(steps, pads, taxonomy, { canvas });
  render.bubbles(pads, taxonomy, { ...canvas });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    onLoad();
  });
} else {
  (async () => {
    await onLoad();
  })();
}
