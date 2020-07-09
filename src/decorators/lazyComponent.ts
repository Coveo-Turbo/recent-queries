import { IComponentDefinition, LazyInitialization, load } from 'coveo-search-ui';
import { component } from './component';

export function lazyDependentComponent(dependentComponentId: string) {
    return constructor => {
        if (!LazyInitialization) {
            return component(constructor);
        }

        LazyInitialization.registerLazyComponent(constructor.ID, () => {
            return load<IComponentDefinition>(dependentComponentId).then(() => component(constructor));
        });
        
        return constructor;
    }
}

export function lazyComponent(constructor) {
    if (!LazyInitialization) {
        return component(constructor);
    }

    LazyInitialization.registerLazyComponent(constructor.ID, component(constructor));
    return constructor;
}
