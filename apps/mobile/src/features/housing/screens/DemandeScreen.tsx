import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ScreenHeader } from '@/shared/ui/ScreenHeader';
import { FilterChip, FilterChipsRow } from '@/shared/ui/FilterChips';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import {
  useSubmitGuidedSearch,
  useGuidedSearchMatches,
} from '@/features/housing/hooks/useGuidedSearch';
import { toMatchListingsArgs } from '@/features/housing/services/guidedSearch.service';
import { MatchCard } from '@/features/housing/components/MatchCard';
import { useSchools } from '@/features/schools/hooks/useSchools';
import { DISTRICTS } from '@/constants/categories';
import type { MatchResult } from '@dakareaseu/types';
import type { GuidedSearchInput } from '@/features/housing/schemas/guidedSearchSchemas';

type HousingOption = Exclude<GuidedSearchInput['type'], 'any'>;

const TYPES: { id: HousingOption; label: string }[] = [
  { id: 'studio', label: 'Studio' },
  { id: 'chambre', label: 'Chambre' },
  { id: 'appartement', label: 'Appartement' },
  { id: 'maison', label: 'Maison' },
  { id: 'coloc', label: 'Colocation' },
];

const PREF_OPTIONS = ['any', 'yes', 'no'] as const;
const BUDGET_PRESETS = [50000, 80000, 120000, 150000];
const TOTAL_STEPS = 4;

type Step = 1 | 2 | 3 | 4 | 'results';

export function DemandeScreen() {
  const { t } = useTranslation();
  const userId = useSessionStore((s) => s.user?.id);
  const submitRequest = useSubmitGuidedSearch();

  const { data: schools } = useSchools();

  const [step, setStep] = useState<Step>(1);
  const [type, setType] = useState<HousingOption | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [budget, setBudget] = useState(80000);
  const [months, setMonths] = useState(3);
  const [furnished, setFurnished] = useState<'any' | 'yes' | 'no'>('any');
  const [coloc, setColoc] = useState<'any' | 'yes' | 'no'>('any');

  const matchArgs = useMemo(() => {
    if (step !== 'results' || !type) return null;
    const input: GuidedSearchInput = {
      type,
      schoolId,
      district,
      budget,
      months,
      furnished,
      coloc,
    };
    return toMatchListingsArgs(input);
  }, [step, type, schoolId, district, budget, months, furnished, coloc]);

  const { data: matches, isLoading: isMatching } = useGuidedSearchMatches(matchArgs);

  const goToResults = async () => {
    if (!userId || !type) return;
    await submitRequest.mutateAsync({
      userId,
      input: { type, schoolId, district, budget, months, furnished, coloc },
    });
    setStep('results');
  };

  // Map raw option values to translated labels
  const prefLabel = (opt: 'any' | 'yes' | 'no') => {
    if (opt === 'yes') return t('demande.optYes');
    if (opt === 'no') return t('demande.optNo');
    return t('demande.optAny');
  };

  return (
    <Screen>
      {/* Pushed screen — back affordance via ScreenHeader */}
      <ScreenHeader title={t('demande.title')} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Progress indicator for wizard steps */}
        {step !== 'results' ? (
          <Text className="mb-4 text-xs font-semibold text-textLight">
            {t('common.stepOf', { current: step as number, total: TOTAL_STEPS })}
          </Text>
        ) : null}

        {step === 1 ? (
          <View>
            <Text className="mb-3 text-base font-semibold text-text">{t('demande.stepType')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((opt) => (
                <Button
                  key={opt.id}
                  label={opt.label}
                  fullWidth={false}
                  variant={type === opt.id ? 'primary' : 'outline'}
                  onPress={() => setType(opt.id)}
                />
              ))}
            </View>
            <View className="mt-6">
              <Button label={t('common.next')} disabled={!type} onPress={() => setStep(2)} />
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View>
            <Text className="mb-3 text-base font-semibold text-text">
              {t('demande.stepLocation')}
            </Text>
            <Text className="mb-2 text-sm font-medium text-text">{t('demande.schoolLabel')}</Text>
            <View className="mb-4 flex-row flex-wrap gap-2">
              <Button
                label={t('demande.schoolAny')}
                fullWidth={false}
                variant={schoolId === null ? 'primary' : 'outline'}
                onPress={() => setSchoolId(null)}
              />
              {schools?.map((s) => (
                <Button
                  key={s.id}
                  label={s.name}
                  fullWidth={false}
                  variant={schoolId === s.id ? 'primary' : 'outline'}
                  onPress={() => setSchoolId(schoolId === s.id ? null : s.id)}
                />
              ))}
            </View>
            <View className="flex-row flex-wrap gap-2">
              {DISTRICTS.map((d) => (
                <Button
                  key={d}
                  label={d}
                  fullWidth={false}
                  variant={district === d ? 'primary' : 'outline'}
                  onPress={() => setDistrict(district === d ? null : d)}
                />
              ))}
            </View>
            <View className="mt-6 flex-row gap-3">
              <Button label={t('common.back')} variant="ghost" onPress={() => setStep(1)} />
              <Button label={t('common.next')} onPress={() => setStep(3)} />
            </View>
          </View>
        ) : null}

        {step === 3 ? (
          <View>
            <Text className="mb-3 text-base font-semibold text-text">
              {t('demande.stepBudget')}
            </Text>
            <View className="rounded-xl border border-border bg-card p-4">
              {/* Budget section */}
              <Text className="mb-1 text-xs font-semibold uppercase text-textLight">
                {t('demande.budgetLabel')}
              </Text>
              <Text className="text-sm text-text">{budget.toLocaleString('fr-FR')} XOF</Text>
              <View className="mt-2 flex-row gap-2">
                <Button
                  label="−10 000"
                  fullWidth={false}
                  variant="outline"
                  onPress={() => setBudget((b) => Math.max(10000, b - 10000))}
                />
                <Button
                  label="+10 000"
                  fullWidth={false}
                  variant="outline"
                  onPress={() => setBudget((b) => b + 10000)}
                />
              </View>
              {/* Quick preset chips */}
              <View className="mt-3">
                <FilterChipsRow>
                  {BUDGET_PRESETS.map((preset) => (
                    <FilterChip
                      key={preset}
                      label={`${(preset / 1000).toLocaleString('fr-FR')}k`}
                      active={budget === preset}
                      onPress={() => setBudget(preset)}
                    />
                  ))}
                </FilterChipsRow>
              </View>

              {/* Duration section */}
              <Text className="mt-4 text-sm text-text">
                {t('listing.minDuration')} : {months} {t('listing.months')}
              </Text>
              <View className="mt-2 flex-row gap-2">
                {[3, 6, 9, 12].map((m) => (
                  <Button
                    key={m}
                    label={`${m}`}
                    fullWidth={false}
                    variant={months === m ? 'primary' : 'outline'}
                    onPress={() => setMonths(m)}
                  />
                ))}
              </View>
            </View>
            <View className="mt-6 flex-row gap-3">
              <Button label={t('common.back')} variant="ghost" onPress={() => setStep(2)} />
              <Button label={t('common.next')} onPress={() => setStep(4)} />
            </View>
          </View>
        ) : null}

        {step === 4 ? (
          <View>
            <Text className="mb-3 text-base font-semibold text-text">
              {t('demande.stepPreferences')}
            </Text>
            <Text className="mb-2 text-sm font-medium text-text">{t('demande.furnishedLabel')}</Text>
            <View className="flex-row gap-2">
              {PREF_OPTIONS.map((opt) => (
                <Button
                  key={opt}
                  label={prefLabel(opt)}
                  fullWidth={false}
                  variant={furnished === opt ? 'primary' : 'outline'}
                  onPress={() => setFurnished(opt)}
                />
              ))}
            </View>
            <Text className="mb-2 mt-4 text-sm font-medium text-text">
              {t('demande.colocationLabel')}
            </Text>
            <View className="flex-row gap-2">
              {PREF_OPTIONS.map((opt) => (
                <Button
                  key={`coloc-${opt}`}
                  label={prefLabel(opt)}
                  fullWidth={false}
                  variant={coloc === opt ? 'primary' : 'outline'}
                  onPress={() => setColoc(opt)}
                />
              ))}
            </View>
            <View className="mt-6 flex-row gap-3">
              <Button label={t('common.back')} variant="ghost" onPress={() => setStep(3)} />
              <Button
                label={t('demande.submit')}
                loading={submitRequest.isPending}
                onPress={goToResults}
              />
            </View>
          </View>
        ) : null}

        {step === 'results' ? (
          <View>
            <Text className="mb-3 text-base font-semibold text-text">
              {t('demande.resultsTitle')}
            </Text>
            {isMatching ? (
              <Text className="text-sm text-textLight">{t('common.loading')}</Text>
            ) : !matches || matches.length === 0 ? (
              <EmptyState icon="search" title={t('demande.noMatches')} />
            ) : (
              matches.map((match: MatchResult) => (
                <MatchCard
                  key={match.listing_id}
                  listingId={match.listing_id ?? ''}
                  matchPct={match.match_pct ?? 0}
                  reasons={match.reasons ?? []}
                />
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
