'use client';

import { createContext, ReactNode, useEffect, useState, useContext } from 'react';
import { createContextualCan } from '@casl/react';
import { AppAbility, createAbility } from '@/libs/ability';
import { useAuthStore } from '@/stores/useAuthStore';

export const AbilityContext = createContext<AppAbility>(createAbility([]));
export const Can = createContextualCan(AbilityContext.Consumer);

export const useAbility = () => useContext(AbilityContext);

export const AbilityProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuthStore();
    const [ability] = useState(() => createAbility(user?.rules || []));

    useEffect(() => {
        if (user?.rules) {
            ability.update(user.rules);
        } else {
            ability.update([]);
        }
    }, [user, ability]);

    return (
        <AbilityContext.Provider value={ability}>
            {children}
        </AbilityContext.Provider>
    );
};
