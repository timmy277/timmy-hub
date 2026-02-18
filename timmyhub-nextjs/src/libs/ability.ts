
import { MongoAbility, createMongoAbility, RawRuleOf } from '@casl/ability';

export enum Action {
    Manage = 'manage',
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
}

export type Subject =
    | 'Product'
    | 'ProductVariant'
    | 'Category'
    | 'Order'
    | 'User'
    | 'SystemRole'
    | 'Permission'
    | 'Review'
    | 'BrandProfile'
    | 'SellerProfile'
    | 'all';

export type AppAbility = MongoAbility<[Action, Subject]>;

export const createAbility = (rules: RawRuleOf<AppAbility>[] = []) => {
    return createMongoAbility<AppAbility>(rules);
};
