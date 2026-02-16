import { d3, interaction, parsers, strings } from '../helpers/index.mjs';
import * as render from './index.mjs';

export const main = function (pads) {
  d3.select('#card-list .card-placeholder').classed('hide', true);

  const card_list = d3.select('#card-list .inner');
  card_list.node().scrollTo(0, 0);
  const card = card_list.addElems('div', 'card', pads)
  .on('mouseover', (evt, d) => {
    interaction.highlight_bubble(d.categories);
    const associated_tags = parsers.getTags(d).map(c => c.tag_id);
    render.portfolio(associated_tags);
    /*
    Highlight the bubbles
    */
    interaction.highlight_tags(associated_tags);
  }).on('mouseout', _ => {
    interaction.highlight_bubble([]);
    render.portfolio([]);
    interaction.highlight_tags([]);
  });

  card.addElems('p', 'card-type')
    .html('What we tested');
  card.addElems('h2', 'card-name')
    .html(d => d.title);
  const description = card.addElems('div', 'card-description');
  description.addElems('h3', 'source').html(d => d.country);
  description.addElems('img', 'card-vignette', d => d.vignette ? [d.vignette] : [])
    .attr('src', d => d)
  .on('error', function () {
    d3.select(this).remove();
  });
  description.addElems('div', 'tag-container')
    .addElems('div', 'tag', d => parsers.getTags(d))
    .html(d => strings.capitalize.call(d.name));
  description.addElems('p').html(d => d.snippet);
  card.addElems('a', 'card-source')
    .attr('href', d => d.url)
    .attr('target', '_blank')
    .html('Read more…');
}