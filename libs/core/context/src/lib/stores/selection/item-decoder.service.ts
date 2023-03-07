import { Injectable } from '@angular/core';

import { Node } from '@alfresco/js-api';

export abstract class AbstractItemDecoder<ItemType> {
    abstract toNode(item: ItemType): Node;
    abstract areEqual(item1: ItemType, item2: ItemType): boolean;
}

@Injectable()
export abstract class ItemDecoder<ItemType> extends AbstractItemDecoder<ItemType> {}

export class DefaultItemDecoder<ItemType> extends AbstractItemDecoder<ItemType> {
    toNode(item: ItemType): Node {
        return item as any as Node;
    }
    areEqual(item1: ItemType, item2: ItemType): boolean {
        return item1['equals'] ? item1['equals'](item2) : item1 === item2;
    }
}
