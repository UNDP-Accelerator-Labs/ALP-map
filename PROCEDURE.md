# Structuring the UNDP Accelerator Labs' Portfolios of Interventions folksonomy with MS CoPilot

## Data gathering

The folksonomy data are pulled from the [SDG Commons API](https://sdg-innovation-commons.org/api-docs), using the ```tags``` endpoint and the parameter ```platform=action plans```. A token is also provided.

The generic request URL resembles:
```
https://sdg-innovation-commons.org/api/tags?timeseries=false&aggregation=day&platform=action%20plan&output=json&include_data=false
```

The result is then structured into a ```python``` list of tuples, with the followign structure:
```
[
  ("tag.name": str, "tag.id": int),
  …
]
```

## Prompt
The list of tuples is then provided to an LLM, in this case MS CoPilot and its underlying GPT model, along with the following prompt.

```
I have a list of tuples. each tuple contains a keyword and a unique id for that keyword. I am trying to structure the keywords into a more meaningful taxonomy of concepts. the keywords are the result of an open coding exercise, meaning some may be similar, some may be identical, but with a type, etc., and I need to make the taxonomy more concise.  I need you to structure this taxonomy, returning the categories, the original keywords that fit into those categories, and the ids of those keywords so I can r-eassociate them with the original content. here is the list of tuples:

[(list, of, tuples)]
```

## Model resoning
Below is a summary of the reasoning provided in the MS CoPilot output.

## What I did (in short)

1. Parsed your list of 728 (keyword, id) pairs (robust to unquoted tokens and &amp; HTML entities).

2. Normalized/cleaned terms (lower‑casing, trimming whitespace, accent folding) and fixed frequent typos & variants, e.g.
  - techonology/technologie → technology
  - woman empowerment/womenempowerment → women empowerment
  - economía circular/circular econom → circular economy
  - green infraestructure → green infrastructure
  - polution reduction → pollution reduction
  - WASH → water, sanitation and hygiene (WASH)
  - Spanish peace/indigenous terms mapped to English canonicals (e.g., agua→ water, Discapacidad→ disability, educación artística para la paz→ arts for peace).

3. Categorized each canonical keyword with rule‑based mapping + overrides (so every single item lands in exactly one category; no “Other” left).

4. Produced deliverables you can plug into your pipeline:
  - Keyword → Category mapping (with original IDs)
  - Canonical ↔ Variants table (to see all synonyms & duplicates)
  - Category summary (counts)

## Assumptions & mapping rules (so you can audit quickly)

- One primary category per term. If a term could fit multiple (e.g., “air pollution” could be climate or urban), I used the most semantically dominant domain:
  - Policy/participation → Governance;
  - Materials/plastics/recycling → Waste & Circular;
  - Digital/ICT/data/AI → Technology, Data & Digital;
  - Informality/SME/markets/jobs → Economy, Markets & Private Sector;
  - Biodiversity/conservation/ecosystems → Ecosystems & Biodiversity;
  - COVID‑19 items default to Health unless overtly emergency‑focused (then DRM & Humanitarian).

- Language unification: Spanish/French variants were canonized to English while preserving the original form & ID.

- Edge cases I resolved explicitly:
  - “responsability” → Governance
  - “self‑sustainable” → Ecosystems & Biodiversity
  - “clean cities” → Urban Development & Infrastructure
  - “positive deviance”, “behavioral insights/change”, “portfolio/sensemaking” → Methods, Innovation & Foresight
  - “afCFTA/cross‑border trading/regional trade” → Economy, Markets & Private Sector

## Note on duplicates/synonyms
The Canonical → Variants file shows exactly how duplicates were merged. Examples:
- “women empowerment” ← variants: woman empowerment (298), womenempowerment (5559)
- “technology” ← variants: techonology (267), technologie (1361)
- “circular economy” ← variants: economía circular (104), circular econom (19641)
- “green infrastructure” ← variant: green infraestructure (150)
- “pollution reduction” ← variant: polution reduction (1715)
- “water, sanitation and hygiene (WASH)” ← variant: wash (1182)