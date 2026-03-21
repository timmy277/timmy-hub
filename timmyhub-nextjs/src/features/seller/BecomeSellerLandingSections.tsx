'use client';

import Image from 'next/image';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Iconify from '@/components/iconify/Iconify';
import { Button } from '@mantine/core';

const HERO_IMAGE =
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80&auto=format&fit=crop';

interface SectionProps {
    onRegister: () => void;
    onLearnMore: () => void;
}

export function BecomeSellerHero({ onRegister, onLearnMore }: SectionProps): ReactElement {
    const { t } = useTranslation('common');
    return (
        <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-20 md:py-20">
            <div className="flex flex-col items-center gap-10 lg:flex-row">
                <div className="flex flex-col gap-8 lg:w-1/2">
                    <div className="flex flex-col gap-4">
                        <span className="inline-block w-fit rounded-full bg-[#238be7]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#238be7]">
                            {t('sellerLanding.hero.badge')}
                        </span>
                        <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl lg:text-6xl">
                            {t('sellerLanding.hero.titlePrefix')}{' '}
                            <span className="text-[#238be7]">{t('sellerLanding.hero.titleBrand')}</span>
                        </h1>
                        <p className="max-w-[600px] text-lg leading-relaxed text-slate-600 dark:text-slate-400 md:text-xl">
                            {t('sellerLanding.hero.description')}
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Button
                            size="lg"
                            className="h-14 min-w-[200px] rounded-xl bg-[#238be7] px-8 text-lg font-bold shadow-lg shadow-[#238be7]/25"
                            onClick={onRegister}
                        >
                            {t('sellerLanding.hero.ctaPrimary')}
                        </Button>
                        <Button
                            size="lg"
                            variant="default"
                            className="h-14 min-w-[200px] rounded-xl border-2 border-slate-200 bg-transparent px-8 text-lg font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            onClick={onLearnMore}
                        >
                            {t('sellerLanding.hero.ctaSecondary')}
                        </Button>
                    </div>
                </div>
                <div className="relative aspect-square w-full lg:w-1/2 lg:aspect-square">
                    <div className="relative h-full min-h-[280px] w-full overflow-hidden rounded-2xl shadow-2xl md:aspect-video lg:aspect-square lg:min-h-[360px]">
                        <Image
                            src={HERO_IMAGE}
                            alt={t('sellerLanding.hero.imageAlt')}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111a21]/40 to-transparent" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BecomeSellerBenefits(): ReactElement {
    const { t } = useTranslation('common');
    const items = [
        { icon: 'tabler:building-store' as const, titleKey: 'b1Title', descKey: 'b1Desc' },
        { icon: 'tabler:users' as const, titleKey: 'b2Title', descKey: 'b2Desc' },
        { icon: 'tabler:headset' as const, titleKey: 'b3Title', descKey: 'b3Desc' },
    ] as const;
    return (
        <section className="bg-white py-20 dark:bg-slate-900/50" id="benefits">
            <div className="mx-auto max-w-[1280px] px-4 md:px-20">
                <div className="mb-16 text-center">
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[#238be7]">
                        {t('sellerLanding.benefits.kicker')}
                    </h2>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">
                        {t('sellerLanding.benefits.title')}
                    </h3>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {items.map(item => (
                        <div
                            key={item.titleKey}
                            className="flex flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-colors hover:border-[#238be7]/50 dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="flex size-14 items-center justify-center rounded-xl bg-[#238be7]/10 text-[#238be7]">
                                <Iconify icon={item.icon} width={32} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                    {t(`sellerLanding.benefits.${item.titleKey}`)}
                                </h4>
                                <p className="leading-normal text-slate-600 dark:text-slate-400">
                                    {t(`sellerLanding.benefits.${item.descKey}`)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function BecomeSellerProcess(): ReactElement {
    const { t } = useTranslation('common');
    const steps = ['step1', 'step2', 'step3'] as const;
    return (
        <section className="bg-[#f6f7f8] py-20 dark:bg-[#111a21]" id="process">
            <div className="mx-auto max-w-[1280px] px-4 md:px-20">
                <div className="mb-16 text-center">
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[#238be7]">
                        {t('sellerLanding.process.kicker')}
                    </h2>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 md:text-4xl">
                        {t('sellerLanding.process.title')}
                    </h3>
                </div>
                <div className="relative flex flex-col justify-between gap-12 md:flex-row">
                    <div className="absolute left-0 top-12 -z-10 hidden h-0.5 w-full bg-slate-200 dark:bg-slate-800 md:block" />
                    {steps.map((key, i) => (
                        <div key={key} className="flex flex-1 flex-col items-center gap-6 text-center">
                            <div className="flex size-20 items-center justify-center rounded-full border-8 border-[#f6f7f8] bg-[#238be7] text-2xl font-bold text-white shadow-xl dark:border-[#111a21]">
                                {i + 1}
                            </div>
                            <div className="flex flex-col gap-2">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                    {t(`sellerLanding.process.${key}.title`)}
                                </h4>
                                <p className="mx-auto max-w-[250px] text-slate-600 dark:text-slate-400">
                                    {t(`sellerLanding.process.${key}.desc`)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function BecomeSellerFees(): ReactElement {
    const { t } = useTranslation('common');
    return (
        <section className="bg-white py-16 dark:bg-slate-900" id="fees">
            <div className="mx-auto max-w-[1280px] px-4 md:px-20">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-800/40">
                    <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {t('sellerLanding.fees.title')}
                    </h3>
                    <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400">
                        {t('sellerLanding.fees.description')}
                    </p>
                </div>
            </div>
        </section>
    );
}

export function BecomeSellerCtaBanner({ onRegister }: Pick<SectionProps, 'onRegister'>): ReactElement {
    const { t } = useTranslation('common');
    return (
        <section className="px-4 py-20" id="cta-register">
            <div className="relative mx-auto max-w-[1000px] overflow-hidden rounded-[2rem] bg-[#238be7] p-10 text-center text-white md:p-16">
                <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
                <h3 className="relative z-10 mb-6 text-3xl font-black md:text-5xl">{t('sellerLanding.cta.title')}</h3>
                <p className="relative z-10 mx-auto mb-10 max-w-2xl text-lg text-white/80 md:text-xl">
                    {t('sellerLanding.cta.subtitle')}
                </p>
                <Button
                    size="xl"
                    className="relative z-10 bg-white px-10 py-5 text-xl font-bold text-[#238be7] shadow-xl hover:bg-slate-100"
                    onClick={onRegister}
                >
                    {t('sellerLanding.cta.button')}
                </Button>
            </div>
        </section>
    );
}
