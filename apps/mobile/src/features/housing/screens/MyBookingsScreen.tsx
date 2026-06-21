import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '@/shared/ui/Screen';
import { Badge, type BadgeTone } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { COLORS } from '@/constants/colors';
import { useMyBookings } from '@/features/housing/hooks/useMyBookings';
import { useSubmitReview } from '@/features/housing/hooks/useReviews';
import type { BookingStatus } from '@dakareaseu/types';

const STATUS_TONE: Record<BookingStatus, BadgeTone> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'neutral',
};
const STATUS_LABEL_KEY: Record<BookingStatus, string> = {
  pending: 'booking.statusPending',
  confirmed: 'booking.statusConfirmed',
  cancelled: 'booking.statusCancelled',
  completed: 'booking.statusCompleted',
};

export function MyBookingsScreen() {
  const { t } = useTranslation();
  const { data: bookings } = useMyBookings();
  const submitReview = useSubmitReview();
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!bookings || bookings.length === 0) {
    return (
      <Screen>
        <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('profile.myBookings')}</Text>
        <EmptyState icon="home" title={t('favorites.empty')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text className="mb-3 mt-2 text-xl font-bold text-text">{t('profile.myBookings')}</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View className="rounded-xl border border-border bg-card p-3">
            <View className="flex-row items-center justify-between">
              <Text numberOfLines={1} className="flex-1 pr-2 text-sm font-semibold text-text">
                {(item as { listings?: { title?: string } }).listings?.title}
              </Text>
              <Badge
                label={t(STATUS_LABEL_KEY[item.status as BookingStatus])}
                tone={STATUS_TONE[item.status as BookingStatus]}
              />
            </View>
            <Text className="mt-1 text-xs text-textLight">
              {item.duration_months} {t('listing.months')} ·{' '}
              {item.total_amount.toLocaleString('fr-FR')}{' '}
              {(item as { listings?: { currency?: string } }).listings?.currency}
            </Text>

            {item.status === 'completed' ? (
              reviewingId === item.id ? (
                <View className="mt-3">
                  <View className="mb-2 flex-row gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable key={star} onPress={() => setRating(star)}>
                        <Icon
                          name={star <= rating ? 'star-filled' : 'star'}
                          size={22}
                          color={star <= rating ? COLORS.accent : COLORS.textLight}
                        />
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder={t('booking.reviewPlaceholder')}
                    placeholderTextColor="#6B7280"
                    multiline
                    className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text"
                  />
                  <View className="mt-2">
                    <Button
                      label={t('common.save')}
                      loading={submitReview.isPending}
                      onPress={async () => {
                        await submitReview.mutateAsync({
                          targetType: 'listing',
                          targetId: item.listing_id,
                          rating,
                          comment,
                        });
                        setReviewingId(null);
                        setComment('');
                        setRating(5);
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View className="mt-3">
                  <Button
                    label={t('booking.leaveReview')}
                    variant="outline"
                    onPress={() => setReviewingId(item.id)}
                  />
                </View>
              )
            ) : null}
          </View>
        )}
      />
    </Screen>
  );
}
