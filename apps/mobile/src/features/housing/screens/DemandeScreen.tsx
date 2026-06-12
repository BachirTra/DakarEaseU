import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import {
  useSubmitGuidedSearch,
  useGuidedSearchMatches,
} from '@/features/housing/hooks/useGuidedSearch';
import { toMatchListingsArgs } from '@/features/housing/services/guidedSearch.service';
import { DISTRICTS } from '@/constants/categories';
import type { ListingType, MatchResult } from '@dakareaseu/types';
import type { GuidedSearchInput } from '@/features/housing/schemas/guidedSearchSchemas';
import type { BadgeTone } from '@/shared/ui/Badge';

const TYPES: { id: ListingType; label: string }[] = [
  { id: 'studio', label: 'Studio' },
  { id: 'chambre', label: 'Chambre' },
  { id: 'appartement', label: 'Appartement' },
  { id: 'maison', label: 'Maison' },
];

type Step = 1 | 2 | 3 | 4 | 'results';

function matchTone(pct: number): BadgeTone {
  if (pct >= 75) return 'success';
  if (pct >= 50) return 'warning';
  return 'neutral';
}

export function DemandeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useSessionStore((s) => s.user?.id);
  const submitRequest = useSubmitGuidedSearch();

  const [step, setStep] = useState<Step>(1);
  const [type, setType] = useState<ListingType | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [budget, setBudget] = useState(80000);
  const [months, setMonths] = useState(3);
  const [furnished, setFurnished] = useState<'any' | 'yes' | 'no'>('any');
  const [coloc, setColoc] = useState<'any' | 'yes' | 'no'>('any');

  const matchArgs = useMemo(() => {
    if (step !== 'results' || !type) return null;
    const input: GuidedSearchInput = {
      type,
      schoolId: null,
      district,
      budget,
      months,
      furnished,
      coloc,
    };
    return toMatchListingsArgs(input);
  }, [step, type, district, budget, months, furnished, coloc]);

  const { data: matches, isLoading: isMatching } = useGuidedSearchMatches(matchArgs);

  const goToResults = async () => {
    if (!userId || !type) return;
    await submitRequest.mutateAsync({
      userId,
      input: { type, schoolId: null, district, budget, months, furnished, coloc },
    });
    setStep('results');
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        <Text className="mb-4 text-xl font-bold text-text">{t('demande.title')}</Text>

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
              <Text className="text-sm text-text">
                Budget : {budget.toLocaleString('fr-FR')} XOF
              </Text>
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
            <Text className="mb-2 text-sm font-medium text-text">{t('listing.furnished')}</Text>
            <View className="flex-row gap-2">
              {(['any', 'yes', 'no'] as const).map((opt) => (
                <Button
                  key={opt}
                  label={opt}
                  fullWidth={false}
                  variant={furnished === opt ? 'primary' : 'outline'}
                  onPress={() => setFurnished(opt)}
                />
              ))}
            </View>
            <Text className="mb-2 mt-4 text-sm font-medium text-text">
              {t('listing.colocation')}
            </Text>
            <View className="flex-row gap-2">
              {(['any', 'yes', 'no'] as const).map((opt) => (
                <Button
                  key={opt}
                  label={opt}
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
              <EmptyState icon="🔍" title={t('demande.noMatches')} />
            ) : (
              matches.map((match: MatchResult) => (
                <View
                  key={match.listing_id}
                  className="mb-3 rounded-xl border border-border bg-card p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Badge
                      label={t('demande.matchScore', { pct: match.match_pct ?? 0 })}
                      tone={matchTone(match.match_pct ?? 0)}
                    />
                  </View>
                  <View className="mt-2 flex-row flex-wrap gap-2">
                    {(match.reasons ?? []).map((reason: string) => (
                      <View key={reason} className="rounded-full bg-bg px-2.5 py-1">
                        <Text className="text-xs text-text">✓ {reason}</Text>
                      </View>
                    ))}
                  </View>
                  <View className="mt-3">
                    <Button
                      label={t('listing.reserve')}
                      variant="outline"
                      onPress={() =>
                        router.push({
                          pathname: '/(tabs)/home/listing/[id]',
                          params: { id: match.listing_id ?? '' },
                        })
                      }
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
