import { Initialization } from 'coveo-search-ui';

export function component(constructor) {
    Initialization.registerAutoCreateComponent(constructor);
    return constructor;
}