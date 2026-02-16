# The UNDP Accelerator Labs Portfolios of Interventions

This [visualization](https://undp-accelerator-labs.github.io/ALP-map/) illustrates the sustainable development priorities and challenges explored by the [UNDP Accelerator Labs](https://www.undp.org/acceleratorlabs) over the past 5+ years in over 100 countries. Each white dot represents a tag used to annotate a reflective documentation on innovation in sustainable development practice. The dots are clustered into larger fluo "bubbles" that represent higher-order categories of thematic interventions. The clustering is semantic, so conceptually similar tags should appear in the same bubble.

This visualization intends to honor the work of the Accelerator Labs and their legacy.
          
## Documentation

Accelerator Labs regularly documented their reflections on innovation in sustainable development practice via Action Learning Plans and associated Post-Hoc Reflections, which are available in the [SDG Commons](https://sdg-innovation-commons.org/) (under ["What we Test"](https://sdg-innovation-commons.org/test/all))\*. These documents were openly tagged, meaning they did not have to fit into a pre-fixed taxonomy of keywords that would characterize the work of the Labs. Instead, the taxonomy was meant to emerge through a "folksonomy".

Folksonomies have the advantage of giving the person who documents or archives information the authority to determine what keywords best characterize the information. However, as a corpus grows, with contributions from many different people, folksonomies tend to generate duplicates&mdash;whether because of simple typos, the use of different languages, or the use of different terms that carry similar meaning&mdash;as well as flattened hierarchies between concepts&mdash;for example, the ontological dependence between the keywords "water" and "waste water" should be "water" > "waste water".
            
We tested several semantic approaches to structuring the floksonomy into an emergent taxonomy. All followed the basic steps of cleaning and embedding the different tags, and clustering them hierarchically. The version used in this visualization was produced more simply using MS Copilot. You can read the documentation [here](https://github.com/UNDP-Accelerator-Labs/ALP-map/blob/llm_revamp/PROCEDURE.md).

Finally, each Action Learning Plan and its associated Post-Hoc Reflection were tagged with up to 5 keywords. This produced a network of co-occurring tags for each learning activity conucted by the Labs, revealing the integrated, portolio approaches they adopted in their work.

\* Note that only Action Learning Plans that have associated Post-Hoc Reflections are reflected in the data.


## Data

The data in this [visualization](https://undp-accelerator-labs.github.io/ALP-map/) are updated dynamically by calling the SDG Commons API. To learn more about the API, visit the [SDG Commons](https://sdg-innovation-commons.org) and read the [Docs](https://sdg-innovation-commons.org/api-docs).
            
To make things easier, you can also dowload a compiled static version of the data below, which provides the structured taxonomy with counts of the number of documents related to each tag. The data are available in .csv and .json formats.

### Static data
- [csv (31 KB)](https://github.com/UNDP-Accelerator-Labs/ALP-map/blob/main/download/learning_themes_202602.csv)
- [json (53 KB)](https://github.com/UNDP-Accelerator-Labs/ALP-map/blob/main/download/learning_themes_202602.json)

## License

The Accelerator Labs Portfolios of Interventions data and code are licensed under the [Creative Commons Attribution-NonCommercial 4.0 International license](https://creativecommons.org/licenses/by-nc/4.0/).