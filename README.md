# Recent Queries

Records user queries and displays it in the UI. The component supports two modes: omnibox mode or standalone mode.

The omnibox mode will append the recent queries under the query suggestions.
The standalone mode will display the recent queries under the `<div class="CoveoRecentQueries">` HTML tag.

## Getting Started

1. Install the component into your project.

```
npm i @coveops/recent-queries
```

2. Use the Component or extend it

Typescript:

```javascript
import { RecentQueries, IRecentQueriesOptions } from '@coveops/recent-queries';
```

Javascript

```javascript
const RecentQueries = require('@coveops/recent-queries').RecentQueries;
```

3. You can also expose the component alongside other components being built in your project.

```javascript
export * from '@coveops/recent-queries'
```

4. Include the component in your template as follows:

Omnibox mode:

Place the component after the `CoveoSearchBox` HTML tag

```html
    <div class="CoveoSearchbox" data-enable-omnibox="true"></div>
    <div class="CoveoRecentQueries" data-show-in-query-suggest="true"></div>
```

Standalone mode:

It is still recommended to place the component after the `CoveoSearchBox` HTML tag, but can be placed anywhere within the `CoveoSearchInterface`

```html
    <div class="CoveoSearchbox" data-enable-omnibox="true"></div>
    <div class="CoveoRecentQueries" data-show-in-query-suggest="false"></div>
```

## Extending

Extending the component can be done as follows:

```javascript
import { RecentQueries, IRecentQueriesOptions } from '@coveops/recent-queries';

export interface IExtendedRecentQueriesOptions extends IRecentQueriesOptions {}

export class ExtendedRecentQueries extends RecentQueries {}
```

## Options

The following options can be configured:

| Option               | Required |  Type   | Default          |                                 Notes                                  |
| -------------------- | -------- | ------- | ---------------- | ---------------------------------------------------------------------- |
| `caption`            | No       | string  | `Recent Queries` | The caption shown above the recent queries in Standalone mode          |
| `numberOfQueries`    | No       | number  | `5`              | Specifies the number of queries to record in storage and display       |
| `isStandalone`       | No       | boolean | `false`          | Specifies whether the searchbox is a standalone                        |
| `useCookies`         | No       | boolean | `false`          | Specifies whether to use cookies or the localStorage                   |
| `showInQuerySuggest` | No       | boolean | `true`           | Specifies which mode to use: true for Omnibox, false for Standalone    |

## Support

The Recent Queries supports the follow locale string ids:

`Recent Queries` - Label to show above the recent queries in Omnibox mode

`Suggested Search Results` - Label to show above the query suggest in Omnibox mode

## Contribute

1. Clone the project
2. Copy `.env.dist` to `.env` and update the COVEO_ORG_ID and COVEO_TOKEN fields in the `.env` file to use your Coveo credentials and SERVER_PORT to configure the port of the sandbox - it will use 8080 by default.
3. Build the code base: `npm run build`
4. Serve the sandbox for live development `npm run serve`