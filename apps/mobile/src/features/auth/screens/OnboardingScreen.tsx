import { useState } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Screen } from '@/shared/ui/Screen';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/features/auth/store/sessionStore';
import { useCompleteOnboarding } from '@/features/auth/hooks/useAuth';
import type { OnboardingAnswers } from '@/features/auth/lib/derivePersona';

// eslint-disable-next-line @typescript-eslint/no-var-requires -- static asset require (no png module typings)
const LOGO = require('../../../../assets/icon.jpeg');

const SLIDES = ['onboarding.slide1', 'onboarding.slide2', 'onboarding.slide3'] as const;

type Step = 0 | 1 | 2 | 'questionLocation' | 'questionFor';

export function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const userId = useSessionStore((s) => s.user?.id);
  const fullName = useSessionStore((s) => s.user?.user_metadata?.full_name as string | undefined);
  const completeOnboarding = useCompleteOnboarding();

  const [step, setStep] = useState<Step>(0);
  const [alreadyInDakar, setAlreadyInDakar] = useState<boolean | null>(null);

  const finish = async (searchingFor: OnboardingAnswers['searchingFor']) => {
    if (!userId || alreadyInDakar === null) return;
    await completeOnboarding.mutateAsync({
      userId,
      fullName: fullName ?? '',
      schoolId: null,
      answers: { alreadyInDakar, searchingFor },
    });
    router.replace('/(auth)/verify-id');
  };

  if (typeof step === 'number') {
    const slideKey = SLIDES[step];
    return (
      <Screen className="justify-between py-8">
        <View className="items-center pt-4">
          <Image source={LOGO} style={{ width: 80, height: 80 }} contentFit="contain" />
        </View>
        <View className="items-center px-4">
          <Badge label={`${step + 1}/3`} tone="primary" />
          <Text className="mt-4 text-center text-2xl font-bold text-text">
            {t(`${slideKey}Title`)}
          </Text>
          <Text className="mt-2 text-center text-base text-textLight">{t(`${slideKey}Body`)}</Text>
        </View>
        <View>
          <Button
            label={step < 2 ? t('common.next') : t('onboarding.start')}
            onPress={() => (step < 2 ? setStep((step + 1) as Step) : setStep('questionLocation'))}
          />
          {step < 2 ? (
            <View className="mt-3 items-center">
              <Text className="text-sm text-textLight" onPress={() => setStep('questionLocation')}>
                {t('common.skip')}
              </Text>
            </View>
          ) : null}
        </View>
      </Screen>
    );
  }

  if (step === 'questionLocation') {
    return (
      <Screen className="justify-center">
        <Text className="mb-6 text-xl font-bold text-text">{t('onboarding.questionLocation')}</Text>
        <View className="gap-3">
          <Button
            label={t('onboarding.answerYes')}
            variant={alreadyInDakar === true ? 'primary' : 'outline'}
            onPress={() => setAlreadyInDakar(true)}
          />
          <Button
            label={t('onboarding.answerNo')}
            variant={alreadyInDakar === false ? 'primary' : 'outline'}
            onPress={() => setAlreadyInDakar(false)}
          />
        </View>
        <View className="mt-8">
          <Button
            label={t('common.next')}
            disabled={alreadyInDakar === null}
            onPress={() => setStep('questionFor')}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen className="justify-center">
      <Text className="mb-6 text-xl font-bold text-text">{t('onboarding.questionFor')}</Text>
      <View className="gap-3">
        <Button
          label={t('onboarding.answerSelf')}
          onPress={() => finish('self')}
          loading={completeOnboarding.isPending}
        />
        <Button
          label={t('onboarding.answerChild')}
          variant="outline"
          onPress={() => finish('child')}
          loading={completeOnboarding.isPending}
        />
      </View>
    </Screen>
  );
}
