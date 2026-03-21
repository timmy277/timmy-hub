'use client';

import { useCallback, type ReactElement } from 'react';
import { Modal, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import {
    BecomeSellerHero,
    BecomeSellerBenefits,
    BecomeSellerProcess,
    BecomeSellerFees,
    BecomeSellerCtaBanner,
} from './BecomeSellerLandingSections';
import { BecomeSellerRegisterForm } from './BecomeSellerRegisterForm';

export function BecomeSellerLandingPage(): ReactElement {
    const { t } = useTranslation('common');
    const [opened, { open, close }] = useDisclosure(false);

    const scrollToBenefits = useCallback((): void => {
        document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    return (
        <div className="min-h-[50vh] w-full bg-[#f6f7f8] text-slate-900 dark:bg-[#111a21] dark:text-slate-100">
            <main className="flex-1">
                <BecomeSellerHero onRegister={open} onLearnMore={scrollToBenefits} />
                <BecomeSellerBenefits />
                <BecomeSellerProcess />
                <BecomeSellerFees />
                <BecomeSellerCtaBanner onRegister={open} />
            </main>

            <Modal
                opened={opened}
                onClose={close}
                title={t('sellerRegister.modalTitle')}
                size="md"
                radius="lg"
                scrollAreaComponent={ScrollArea.Autosize}
            >
                <BecomeSellerRegisterForm onSuccess={close} />
            </Modal>
        </div>
    );
}
