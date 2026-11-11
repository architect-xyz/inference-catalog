# inference-catalog

Logos and metadata of the products and services in the inference market:
the companies that make models, the providers that serve them, the harnesses
that call them, and the models themselves.

Each entity is one JSON file. Each logo is one image file. A schema in
`schemas/` describes every kind of file, and `npm run validate` checks them.

## Layout

| Path                         | Holds                                                                   |
| ---------------------------- | ----------------------------------------------------------------------- |
| `creators/<id>.json`         | A company that makes models, with its aliases (`meta-llama` → `meta`)   |
| `providers/<id>.json`        | A cloud platform, model maker API, inference cloud or exchange          |
| `harnesses/<id>.json`        | A coding agent, SDK, framework or gateway                               |
| `models/<creator>/<name>.json` | One model identity: kind, aliases, parameters, tokenizer, references  |
| `logos/<namespace>/<id>.<ext>` | The images. Namespaces: `icons`, `providers`, `harnesses`             |
| `logos/index.json`           | Every logo with its file, type and size (`npm run index` writes it)     |
| `rules/model-logos.json`     | How to pick a logo for a model name                                     |
| `schemas/`                   | JSON Schema of each file kind                                           |
| `packages/react/`            | `@architect-xyz/inference-catalog-react`                                |

A `logo` field is a reference, `<namespace>/<id>`, without the extension. For
example `icons/claude` is the file `logos/icons/claude.jpg`. Many entities can
point at one icon: `meta` and `meta-llama` both use `icons/llama`.

A model takes its logo from `rules/model-logos.json`: the exact name first,
then the family (the first word of the name), then the creator, then the
Hugging Face logo. The file of a model holds the result for its canonical name.

## React

```sh
npm install @architect-xyz/inference-catalog-react
```

```tsx
import { CreatorLogo, ProviderLogo, HarnessLogo, ModelLogo } from '@architect-xyz/inference-catalog-react'

<CreatorLogo id="anthropic" size={24} />
<ProviderLogo id="bedrock" />
<HarnessLogo id="claude-code" />
<ModelLogo model="claude-opus-4.6" creator="anthropic" />
```

- Each logo is its own chunk. A page downloads only the logos that it shows.
  Until a logo loads, and when the catalog has none, the component draws a
  monogram of the name. No broken image shows.
- Take one logo as a `data:` URI, with no component:
  `import src from '@architect-xyz/inference-catalog-react/logos/icons/claude'`.
- `Logo` takes any reference: `<Logo logo="icons/claude" name="Claude" />`.
- Lookups: `getCreator` (accepts an alias in any letter case), `getProvider`,
  `getHarness`, `listCreators`, `listProviders`, `listHarnesses` and
  `modelLogoRef(model, creator?)`.

## Add or change an entry

1. Add the logo to `logos/<namespace>/`. The id is the file name. Use a square
   image of 64 px or more. Use JPEG for a photo with no transparency, and PNG
   or SVG for the rest.
2. Add or edit the JSON file. The file name is the `id`. For a model, it is the
   canonical name in lowercase, with every character outside `a-z0-9._-`
   replaced by `_`.
3. Run `npm run build`. It validates the files, writes `logos/index.json`, and
   builds the React package. A logo that has no file, an alias that two
   creators use, and a file in the wrong place all fail the validation.

## Provenance

- `logos/icons/` is the artwork of [TypingMind's model-icons](https://github.com/TypingMind/model-icons)
  (MIT, pinned at `124e1dec357f1aa4562b201e72db82f7d15fe8b4`, resized to 64 px),
  plus a few files that were added by hand. See `NOTICE.md`.
- `models/` was exported from the model registry of the Liquid Inference
  exchange, which it fills from public model lists. A `revision` is present only
  when the registry knows one.
- `creators/` merges the exchange's creator list and its console's creator list.
