import { Action } from './action.enum';
import { AbilityBuilder, MongoAbility, createMongoAbility, MongoQuery } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import {
    User,
    UserRole,
    UserSystemRole,
    RolePermission,
    Permission,
    UserPermission,
    SystemRole,
    Profile,
    Product,
    Order,
} from '@prisma/client';

type Subjects =
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

export type AppAbility = MongoAbility<[Action, Subjects], MongoQuery>;

export type UserWithPermissions = User & {
    userRoles: (UserSystemRole & {
        role: SystemRole & {
            permissions: (RolePermission & { permission: Permission })[];
        };
    })[];
    userPermissions: (UserPermission & { permission: Permission })[];
    profile?: Profile | null;
};

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: UserWithPermissions) {
        const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

        if (user.roles?.includes(UserRole.SUPER_ADMIN)) {
            can(Action.Manage, 'all');
        } else {
            // Role-based permissions
            user.userRoles?.forEach(ur => {
                ur.role.permissions.forEach(rp => {
                    const action = this.mapAction(rp.permission.action);
                    const subject = this.mapSubject(rp.permission.module);
                    if (action && subject) can(action, subject);
                });
            });

            // Direct permissions
            user.userPermissions?.forEach(up => {
                const action = this.mapAction(up.permission.action);
                const subject = this.mapSubject(up.permission.module);
                if (action && subject) can(action, subject);
            });

            // Conditional ABAC Rules
            if (user.roles?.includes(UserRole.SELLER)) {
                // Strict property checking using MongoQuery<Model>
                can(Action.Manage, 'Product', { sellerId: user.id } as MongoQuery<Product>);
                cannot(Action.Delete, 'Product', { soldCount: { $gt: 0 } } as MongoQuery<Product>);
            }

            if (user.roles?.includes(UserRole.CUSTOMER)) {
                can(Action.Read, 'Order', { userId: user.id } as MongoQuery<Order>);
                can(Action.Create, 'Order');
            }
        }

        return build() as AppAbility;
    }

    private mapAction(dbAction: string): Action | null {
        switch (dbAction.toLowerCase()) {
            case 'manage':
                return Action.Manage;
            case 'create':
                return Action.Create;
            case 'read':
                return Action.Read;
            case 'update':
                return Action.Update;
            case 'delete':
                return Action.Delete;
            default:
                return null;
        }
    }

    private mapSubject(dbModule: string): Subjects | null {
        switch (dbModule.toLowerCase()) {
            case 'product':
                return 'Product';
            case 'productvariant':
                return 'ProductVariant';
            case 'category':
                return 'Category';
            case 'order':
                return 'Order';
            case 'user':
                return 'User';
            case 'systemrole':
                return 'SystemRole';
            case 'permission':
                return 'Permission';
            case 'review':
                return 'Review';
            case 'brandprofile':
                return 'BrandProfile';
            case 'sellerprofile':
                return 'SellerProfile';
            case 'all':
                return 'all';
            default:
                return dbModule as Subjects;
        }
    }
}
