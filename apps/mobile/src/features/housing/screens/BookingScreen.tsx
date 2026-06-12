import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/shared/ui/Screen";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { useTranslation } from "@/hooks/useTranslation";
import { useListingDetail } from "@/features/housing/hooks/useListingDetail";
import { useCreateBooking } from "@/features/housing/hooks/useCreateBooking";
import type { ListingColivingRoom, PaymentMethod } from "@dakareaseu/types";

const PAYMENT_METHODS: { id: PaymentMethod; labelKey: string }[] = [
  { id: "wave", labelKey: "booking.payWithWave" },
  { id: "orange_money", labelKey: "booking.payWithOrange" },
  { id: "card", labelKey: "booking.payWithCard" },
];

type Step = "dates" | "payment" | "summary" | "success";

export function BookingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { listingId, roomId } = useLocalSearchParams<{ listingId: string; roomId?: string }>();
  const { data: listing } = useListingDetail(listingId);
  const createBooking = useCreateBooking();

  const [step, setStep] = useState<Step>("dates");
  const [durationMonths, setDurationMonths] = useState(listing?.min_duration_months ?? 3);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const room = useMemo(
    () => listing?.listing_coliving_rooms?.find((r: Pick<ListingColivingRoom, "id" | "label" | "price" | "surface_m2" | "is_available">) => r.id === roomId) ?? null,
    [listing, roomId]
  );
  const unitPrice = room ? room.price : listing?.price ?? 0;
  const minDuration = listing?.min_duration_months ?? 3;
  const total = unitPrice * durationMonths;
  const startDate = new Date().toISOString().slice(0, 10);

  if (!listing) return null;

  const submit = async () => {
    if (!paymentMethod) return;
    await createBooking.mutateAsync({
      listingId: listing.id,
      colivingRoomId: room?.id ?? null,
      startDate,
      durationMonths,
      unitPrice,
      currency: listing.currency,
      paymentMethod,
    });
    setStep("success");
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 16 }}>
        <Text className="mb-4 text-xl font-bold text-text">{t("booking.title")}</Text>

        {step === "dates" ? (
          <View>
            <Text className="mb-2 text-sm font-semibold text-text">{t("booking.stepDates")}</Text>
            <Text className="mb-3 text-xs text-textLight">{t("booking.minDurationNotice", { count: minDuration })}</Text>
            <View className="flex-row items-center justify-between rounded-xl border border-border bg-card p-4">
              <Text className="text-sm text-text">{t("booking.duration")}</Text>
              <View className="flex-row items-center gap-4">
                <Text className="text-lg font-bold text-primary" onPress={() => setDurationMonths((d: number) => Math.max(minDuration, d - 1))}>−</Text>
                <Text className="text-base font-semibold text-text">{durationMonths}</Text>
                <Text className="text-lg font-bold text-primary" onPress={() => setDurationMonths((d: number) => d + 1)}>+</Text>
              </View>
            </View>
            <View className="mt-6">
              <Button label={t("common.next")} onPress={() => setStep("payment")} />
            </View>
          </View>
        ) : null}

        {step === "payment" ? (
          <View>
            <Text className="mb-3 text-sm font-semibold text-text">{t("booking.paymentMethod")}</Text>
            <View className="gap-2">
              {PAYMENT_METHODS.map((m) => (
                <Button key={m.id} label={t(m.labelKey)} variant={paymentMethod === m.id ? "primary" : "outline"} onPress={() => setPaymentMethod(m.id)} />
              ))}
            </View>
            <View className="mt-6 flex-row gap-3">
              <Button label={t("common.back")} variant="ghost" onPress={() => setStep("dates")} />
              <Button label={t("common.next")} disabled={!paymentMethod} onPress={() => setStep("summary")} />
            </View>
          </View>
        ) : null}

        {step === "summary" ? (
          <View>
            <Text className="mb-3 text-sm font-semibold text-text">{t("booking.stepSummary")}</Text>
            <View className="rounded-xl border border-border bg-card p-4">
              <Text className="text-sm text-text">{listing.title}</Text>
              {room ? <Text className="mt-1 text-xs text-textLight">{room.label}</Text> : null}
              <View className="mt-3 flex-row justify-between">
                <Text className="text-xs text-textLight">{t("booking.duration")}</Text>
                <Text className="text-xs text-text">{durationMonths} {t("listing.months")}</Text>
              </View>
              <View className="mt-1 flex-row justify-between">
                <Text className="text-xs text-textLight">{t("booking.paymentMethod")}</Text>
                <Text className="text-xs text-text">{paymentMethod ? t(PAYMENT_METHODS.find((m) => m.id === paymentMethod)!.labelKey) : "—"}</Text>
              </View>
              <View className="mt-3 flex-row justify-between border-t border-border pt-3">
                <Text className="text-sm font-semibold text-text">{t("booking.total")}</Text>
                <Text className="text-base font-bold text-primary">{total.toLocaleString("fr-FR")} {listing.currency}</Text>
              </View>
            </View>
            <View className="mt-6 flex-row gap-3">
              <Button label={t("common.back")} variant="ghost" onPress={() => setStep("payment")} />
              <Button label={t("booking.confirmAndPay")} loading={createBooking.isPending} onPress={submit} />
            </View>
          </View>
        ) : null}

        {step === "success" ? (
          <View className="items-center py-10">
            <Badge label={t("booking.statusPending")} tone="warning" />
            <Text className="mt-4 text-center text-lg font-bold text-text">{t("booking.success")}</Text>
            <Text className="mt-2 text-center text-sm text-textLight">{t("booking.successBody")}</Text>
            <View className="mt-6 w-full">
              <Button label={t("common.confirm")} onPress={() => router.replace("/(tabs)/home")} />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
