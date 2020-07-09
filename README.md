# Coveo Turbo Core

The Coveo Turbo Core library provides common utilities to facilitate turbo-charged JSUI component development.

Disclaimer: This library was built by the community at large and is not an official Coveo JSUI Component. Use this component at your own risk.

## Getting Started

1. Install the library into your project.

```
npm i @coveops/turbo-core
```

## Decorators

### Component Initialization

Coveo's component registration allows for two main strategies to load a component once the scripts and markup are present on the page: [Eager and Lazy](https://docs.coveo.com/en/295/javascript-search-framework/lazy-versus-eager-component-loading).

These decorators make it simple to choose the initialization structure without requiring boilerplate code. All of the strategies fallback to `component` if the `LazyInitialization` class isn't present by importing `Coveo.Lazy.js`.

#### `component`

The `component` decorator injects the `Initialization` call. It is the equivalent of having the following code at the bottom of each component:

```javascript
class CustomComponent extends Component {}
Initialization.registerAutoCreateComponent(CustomComponent);
```

**To use:**

Typescript:

```javascript
import { component } from '@coveopos/turbo-core'

@component
export class CustomComponent extends Component {}
```

Vanilla Javascript:

```javascript
const component = require('@coveopos/turbo-core').component;

const CustomComponent = (function(_super) {})(Component);
module.exports.CustomComponent = component(CustomComponent);
```

#### `lazy`

The `lazy` decorator injects the `LazyInitialization` call. It is the equivalent of having the following code at the bottom of each component:

```javascript
class CustomComponent extends Component {}
LazyInitialization.registerLazyComponent(CustomComponent.ID, () => {
    Initialization.registerAutoCreateComponent(CustomComponent);
    return CustomComponent;
});
```

**To use:**

Typescript:

```javascript
import { lazyComponent } from '@coveopos/turbo-core'

@lazyComponent
export class CustomComponent extends Component {}
```

Vanilla Javascript:

```javascript
const lazyComponent = require('@coveopos/turbo-core').lazyComponent;

const CustomComponent = (function(_super) {})(Component);
module.exports.CustomComponent = lazyComponent(CustomComponent);
```

#### `lazy-dependent`

The `lazy-dependent` decorator injects the `LazyInitialization` call and ensures the dependent component is loaded first. It is the equivalent of having the following code at the bottom of each component:

```javascript
class CustomComponent extends Component {}
LazyInitialization.registerLazyComponent(CustomComponent.ID, () => {
    return load<IComponentDefinition>(dependentComponentId).then(() => {
        Initialization.registerAutoCreateComponent(CustomComponent);
        return CustomComponent;
    });
});
```

The key difference in implementation, is the ID of the dependent component must be passed as an argument to the decorator.

**To use:**

Typescript:

```javascript
import { lazyDependentComponent } from '@coveopos/turbo-core'

@lazyDependentComponent('ResultList')
export class CustomComponent extends Component {}
```

Vanilla Javascript:

```javascript
const lazyDependentComponent = require('@coveopos/turbo-core').lazyDependentComponent;

const CustomComponent = (function(_super) {})(Component);
module.exports.CustomComponent = lazyDependentComponent('ResultList')(CustomComponent);
```

## Utilities

### `swapVar`

Merges the Coveo namespace with the namespace of the component so that exported components can be instantiated from the `Coveo` global object. Declare it after your exports at the root `index` file.

**To use:**

Typescript:

```javascript
import { swapVar } from '@coveopos/turbo-core'

swapVar(this)

Vanilla Javascript:

```javascript
const swapVar = require('@coveopos/turbo-core').swapVar;

swapVar(module.exports);
```

## Contribute

1. Clone the project
2. Build the code base: `npm run build`
3. Run `npm pack` to get a local build
4. Copy the resulting `.tgz` file to a test project, and install it.