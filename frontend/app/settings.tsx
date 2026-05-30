import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, Globe, Compass, Trash2, Info } from 'lucide-react-native';

import StarryBackground from '../src/components/StarryBackground.js';
import { Heading, BodyText, Label } from '../src/components/UI.js';
import { useLang } from '../src/context/Lang.js';
import { useChartsStore } from '../src/store/charts.js';
import { usePrefsStore } from '../src/store/prefs.js';
import { COLORS, FONTS } from '../src/theme.js';

const APP_VERSION = '1.7.0';

export default function Settings() {
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const hemisphere = usePrefsStore((s) => s.hemisphere);
  const setHemisphere = usePrefsStore((s) => s.setHemisphere);
  const chartsCount = useChartsStore((s) => s.charts.length);
  const clearAll = useChartsStore((s) => s.clearAll);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const onClearCharts = useCallback(() => {
    if (Platform.OS === 'web') {
      setConfirmingClear(true);
      return;
    }
    Alert.alert(
      t('settings_clear_confirm'),
      t('settings_clear_confirm_body'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => clearAll(),
        },
      ],
      { cancelable: true }
    );
  }, [t, clearAll]);

  return (
    <StarryBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID="settings-scroll"
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              testID="back-from-settings"
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityLabel={t('back')}
            >
              <ChevronLeft size={22} color={COLORS.gold} strokeWidth={1.6} />
            </TouchableOpacity>
          </View>

          <Animated.View entering={FadeInDown.duration(600)}>
            <Label>{t('settings_subtitle')}</Label>
            <Heading level={1}>{t('settings')}</Heading>
          </Animated.View>

          {/* Language */}
          <Animated.View entering={FadeInDown.duration(600).delay(80)} style={styles.group}>
            <View style={styles.groupHeader}>
              <Globe size={16} color={COLORS.gold} strokeWidth={1.4} />
              <Text style={styles.groupTitle}>{t('settings_language')}</Text>
            </View>
            <View style={styles.segment} testID="settings-lang-segment">
              <SegBtn
                active={lang === 'en'}
                label="English"
                onPress={() => setLang('en')}
                testID="set-lang-en"
              />
              <SegBtn
                active={lang === 'fr'}
                label="Français"
                onPress={() => setLang('fr')}
                testID="set-lang-fr"
              />
            </View>
          </Animated.View>

          {/* Hemisphere */}
          <Animated.View entering={FadeInDown.duration(600).delay(150)} style={styles.group}>
            <View style={styles.groupHeader}>
              <Compass size={16} color={COLORS.gold} strokeWidth={1.4} />
              <Text style={styles.groupTitle}>{t('settings_hemisphere')}</Text>
            </View>
            <View style={styles.segment} testID="settings-hemi-segment">
              <SegBtn
                active={hemisphere === 'N'}
                label={t('north')}
                onPress={() => setHemisphere('N')}
                testID="set-hemi-n"
              />
              <SegBtn
                active={hemisphere === 'S'}
                label={t('south')}
                onPress={() => setHemisphere('S')}
                testID="set-hemi-s"
              />
            </View>
          </Animated.View>

          {/* Data */}
          <Animated.View entering={FadeInDown.duration(600).delay(220)} style={styles.group}>
            <View style={styles.groupHeader}>
              <Trash2 size={16} color={COLORS.terracotta} strokeWidth={1.4} />
              <Text style={[styles.groupTitle, { color: COLORS.terracotta }]}>
                {t('settings_data')}
              </Text>
            </View>
            <Text style={styles.dataInfo}>
              {lang === 'fr'
                ? `${chartsCount} charte${chartsCount === 1 ? '' : 's'} sauvegardée${chartsCount === 1 ? '' : 's'} sur cet appareil.`
                : `${chartsCount} chart${chartsCount === 1 ? '' : 's'} stored on this device.`}
            </Text>
            {confirmingClear ? (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmText}>{t('settings_clear_confirm_body')}</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <TouchableOpacity
                    style={styles.confirmCancel}
                    onPress={() => setConfirmingClear(false)}
                    testID="cancel-clear-all"
                  >
                    <Text style={styles.confirmCancelText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmDelete}
                    onPress={() => {
                      clearAll();
                      setConfirmingClear(false);
                    }}
                    testID="confirm-clear-all"
                  >
                    <Text style={styles.confirmDeleteText}>{t('delete')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                testID="settings-clear-charts"
                style={[styles.dangerBtn, chartsCount === 0 && styles.dangerBtnDisabled]}
                activeOpacity={0.85}
                onPress={onClearCharts}
                disabled={chartsCount === 0}
              >
                <Trash2 size={14} color={COLORS.terracotta} strokeWidth={1.6} />
                <Text style={styles.dangerBtnText}>{t('settings_clear_charts')}</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* About */}
          <Animated.View entering={FadeInDown.duration(600).delay(290)} style={styles.group}>
            <View style={styles.groupHeader}>
              <Info size={16} color={COLORS.textMuted} strokeWidth={1.4} />
              <Text style={[styles.groupTitle, { color: COLORS.textMuted }]}>
                {t('settings_about')}
              </Text>
            </View>
            <TouchableOpacity
              testID="settings-about"
              activeOpacity={0.75}
              onPress={() => router.push('/about')}
              style={styles.aboutBtn}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.aboutTitle}>{t('about_title')}</Text>
                <Text style={styles.aboutSubtitle}>
                  {lang === 'fr' ? 'Lire la philosophie' : 'Read the philosophy'}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>{t('settings_version')}</Text>
              <Text style={styles.versionValue}>{APP_VERSION}</Text>
            </View>
          </Animated.View>

          <Text style={styles.disclaimer}>{t('disclaimer')}</Text>
        </ScrollView>
      </SafeAreaView>
    </StarryBackground>
  );
}

function SegBtn({ active, label, onPress, testID }) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.segBtn, active && styles.segBtnActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.segBtnText, active && styles.segBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 60,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderStrong,
  },
  group: {
    marginTop: 30,
    backgroundColor: 'rgba(21,25,33,0.7)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    padding: 18,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  groupTitle: {
    color: COLORS.gold,
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderStrong,
    overflow: 'hidden',
  },
  segBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  segBtnActive: {
    backgroundColor: 'rgba(212,175,55,0.16)',
  },
  segBtnText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    letterSpacing: 1.5,
  },
  segBtnTextActive: {
    color: COLORS.gold,
    fontFamily: FONTS.bodySemi,
  },
  dataInfo: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 13,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(194,122,98,0.5)',
    backgroundColor: 'rgba(194,122,98,0.06)',
  },
  dangerBtnDisabled: {
    opacity: 0.4,
  },
  dangerBtnText: {
    color: COLORS.terracotta,
    fontFamily: FONTS.bodySemi,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  confirmBox: {
    padding: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(194,122,98,0.5)',
    backgroundColor: 'rgba(194,122,98,0.08)',
  },
  confirmText: {
    color: COLORS.terracotta,
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 19,
  },
  confirmCancel: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  confirmCancelText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  confirmDelete: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: COLORS.terracotta,
    flex: 1,
    alignItems: 'center',
  },
  confirmDeleteText: {
    color: COLORS.bg,
    fontFamily: FONTS.bodySemi,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  aboutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  aboutTitle: {
    color: COLORS.text,
    fontFamily: FONTS.serifBold,
    fontSize: 18,
  },
  aboutSubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 2,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  versionLabel: {
    color: COLORS.textDim,
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  versionValue: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  disclaimer: {
    color: COLORS.textDim,
    fontFamily: FONTS.body,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
