import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';

export interface Country {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: 'SN', dialCode: '+221', flag: '🇸🇳', name: 'Sénégal' },
  { code: 'FR', dialCode: '+33', flag: '🇫🇷', name: 'France' },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'États-Unis' },
  { code: 'ML', dialCode: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: 'CI', dialCode: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: 'GN', dialCode: '+224', flag: '🇬🇳', name: 'Guinée' },
  { code: 'MR', dialCode: '+222', flag: '🇲🇷', name: 'Mauritanie' },
  { code: 'GM', dialCode: '+220', flag: '🇬🇲', name: 'Gambie' },
  { code: 'GH', dialCode: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: 'NG', dialCode: '+234', flag: '🇳🇬', name: 'Nigéria' },
  { code: 'MA', dialCode: '+212', flag: '🇲🇦', name: 'Maroc' },
  { code: 'TN', dialCode: '+216', flag: '🇹🇳', name: 'Tunisie' },
  { code: 'BE', dialCode: '+32', flag: '🇧🇪', name: 'Belgique' },
  { code: 'CA', dialCode: '+1', flag: '🇨🇦', name: 'Canada' },
];

export function parsePhoneE164(dialCode: string, number: string): string {
  const digits = number.replace(/\D/g, '');
  return `${dialCode}${digits}`;
}

export function splitPhoneE164(phone: string | null): { dialCode: string; number: string } {
  if (!phone) return { dialCode: '+221', number: '' };
  const match = COUNTRIES.find((c) => phone.startsWith(c.dialCode));
  if (match) {
    return { dialCode: match.dialCode, number: phone.slice(match.dialCode.length) };
  }
  return { dialCode: '+221', number: phone.replace(/^\+\d+/, '') };
}

interface PhoneInputProps {
  value: string | null;
  onChange: (e164: string) => void;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, placeholder = 'Numéro de téléphone' }: PhoneInputProps) {
  const parsed = splitPhoneE164(value);
  const SENEGAL: Country = { code: 'SN', dialCode: '+221', flag: '🇸🇳', name: 'Sénégal' };
  const defaultCountry = COUNTRIES.find((c) => c.dialCode === parsed.dialCode) ?? SENEGAL;
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
  const [number, setNumber] = useState(parsed.number);
  const [modalVisible, setModalVisible] = useState(false);

  const handleNumberChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    setNumber(digits);
    onChange(parsePhoneE164(selectedCountry.dialCode, digits));
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setModalVisible(false);
    onChange(parsePhoneE164(country.dialCode, number));
  };

  return (
    <>
      <View className="flex-row items-center rounded-xl border border-border bg-card">
        <Pressable
          onPress={() => setModalVisible(true)}
          className="flex-row items-center border-r border-border px-3 py-3"
        >
          <Text className="text-base">{selectedCountry.flag}</Text>
          <Text className="ml-1.5 text-sm font-semibold text-text">{selectedCountry.dialCode}</Text>
          <Text className="ml-1 text-xs text-textLight">▾</Text>
        </Pressable>
        <TextInput
          value={number}
          onChangeText={handleNumberChange}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          keyboardType="phone-pad"
          className="flex-1 px-3 py-3 text-sm text-text"
        />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/40">
          <View className="mt-auto rounded-t-3xl bg-bg pt-4" style={{ maxHeight: '70%' }}>
            <View className="mb-3 flex-row items-center justify-between px-4">
              <Text className="text-base font-bold text-text">Indicatif pays</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text className="text-sm font-semibold text-primary">Fermer</Text>
              </Pressable>
            </View>
            <SafeAreaView>
              <FlatList
                data={COUNTRIES}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleCountrySelect(item)}
                    className={`flex-row items-center px-4 py-3 ${item.code === selectedCountry.code ? 'bg-primary/10' : ''}`}
                  >
                    <Text className="text-xl">{item.flag}</Text>
                    <Text className="ml-3 flex-1 text-sm text-text">{item.name}</Text>
                    <Text className="text-sm font-semibold text-textLight">{item.dialCode}</Text>
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View className="h-px bg-border" />}
              />
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </>
  );
}
