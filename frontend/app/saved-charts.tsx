import React, { useCallback, useMemo, useState } from 'react';
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
import { ChevronLeft, BookOpen, Trash2, ArrowRight, Sparkles } from 'lucide-react-native';

import StarryBackground from '../src/components/StarryBackground.js';
import LangToggle from '../src/components/LangToggle.js';
import { Heading, BodyText, Label, Chip } from '../src/components/UI.js';
import { useLang } from '../src/context/Lang.js';
import { useChartsStore } from '../src/store/charts.js';
import { COLORS, FONTS } from '../src/theme.js';

export default function SavedCharts() {
  const router = useRouter();
  const { t, lang } = useLang();
  const charts = useChartsStore((s) => s.charts);
  const removeChart = useChartsStore((s) => s.removeChart);
  const [pendingDelete, setPendingDelete] = useState(null);

  const subtitle = useMemo(() => {
    const fn = t('saved_count');
    return typeof fn === 'function' ? fn(charts.length) : `${charts.length}`;
  }, [t, charts.length]);

  const handleOpen = useCallback(
    (entry) => {
      // Navigate to result with the saved chart payload + hour
      router.push({
        pathname: '/result',
        params: {
          chart: JSON.stringify(entry.chart),
          birth_hour: entry.birthHour !== null ? String(entry.birthHour) : '',
        },
      });
    },
    [router]
  );

  const confirmDelete = useCallback(
    (entry) => {
      // Use Alert on native, simple inline state on web (since Alert doesn't show modals on web).
      if (Platform.OS === 'web') {
        setPendingDelete(entry.id);
        return;
      }
      Alert.alert(
        t('delete_confirm'),
        t('delete_confirm_body'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('delete'),
            style: 'destructive',
            onPress: () => removeChart(entry.id),
          },
        ],
        { cancelable: true }
      );
    },
    [t, removeChart]
  );

  const formatDate = useCallback(
    (iso) => {
      try {
        const d = new Date(iso);
        return d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      } catch {
        return '';
      }
    },
    [lang]
  );

  return (
    <StarryBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID="saved-charts-scroll"
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              testID="back-from-saved"
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityLabel={t('back')}
            >
              <ChevronLeft size={22} color={COLORS.gold} strokeWidth={1.6} />
            </TouchableOpacity>
            <LangToggle />
          </View>

          <Animated.View entering={FadeInDown.duration(600)}>
            <Label>{t('saved_charts_subtitle')}</Label>
            <Heading level={1}>{t('saved_charts')}</Heading>
            <View style={{ height: 8 }} />
            <BodyText dim>{subtitle}</BodyText>
          </Animated.View>

          {charts.length === 0 ? (
            <Animated.View entering={FadeInDown.duration(600).delay(150)} style={styles.empty}>
              <View style={styles.emptyIcon}>
                <BookOpen size={28} color={COLORS.textMuted} strokeWidth={1.2} />
              </View>
              <Text style={styles.emptyTitle}>{t('empty_saved_title')}</Text>
              <Text style={styles.emptyBody}>{t('empty_saved_body')}</Text>
              <TouchableOpacity
                testID="empty-cta-create"
                style={styles.emptyCta}
                activeOpacity={0.85}
                onPress={() => router.push('/chart')}
              >
                <Sparkles size={14} color={COLORS.bg} strokeWidth={2} />
                <Text style={styles.emptyCtaText}>{t('cta_generate')}</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(600).delay(150)} style={{ marginTop: 22 }}>
              {charts.map((entry, idx) => {
                const sign = entry.chart?.sign?.[lang] || entry.chart?.sign?.en;
                const elements = entry.chart?.elements || [];
                const isPending = pendingDelete === entry.id;
                return (
                  <Animated.View
                    key={entry.id}
                    entering={FadeInDown.duration(500).delay(50 * idx)}
                    style={styles.card}
                    testID={`saved-card-${entry.id}`}
                  >
                    <TouchableOpacity
                      style={styles.cardMain}
                      activeOpacity={0.7}
                      onPress={() => handleOpen(entry)}
                      testID={`open-saved-${entry.id}`}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardLabel}>{entry.label}</Text>
                        <Text style={styles.cardSign}>{sign?.name || '—'}</Text>
                        <Text style={styles.cardMeta}>
                          {formatDate(entry.chart?.birth_date)}
                          {entry.birthHour !== null
                            ? ` · ${String(entry.birthHour).padStart(2, '0')}h`
                            : ''}
                        </Text>
                        {elements.length > 0 ? (
                          <View style={styles.chipRow}>
                            {elements.map((el) => (
                              <Chip key={el} label={el} />
                            ))}
                          </View>
                        ) : null}
                        {entry.notes ? (
                          <Text style={styles.cardNotes} numberOfLines={2}>
                            {entry.notes}
                          </Text>
                        ) : null}
                      </View>
                      <ArrowRight size={18} color={COLORS.gold} strokeWidth={1.4} />
                    </TouchableOpacity>

                    {isPending ? (
                      <View style={styles.confirmRow}>
                        <Text style={styles.confirmText}>{t('delete_confirm')}</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            style={styles.confirmCancel}
                            onPress={() => setPendingDelete(null)}
                            testID={`cancel-delete-${entry.id}`}
                          >
                            <Text style={styles.confirmCancelText}>{t('cancel')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.confirmDelete}
                            onPress={() => {
                              removeChart(entry.id);
                              setPendingDelete(null);
                            }}
                            testID={`confirm-delete-${entry.id}`}
                          >
                            <Text style={styles.confirmDeleteText}>{t('delete')}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => confirmDelete(entry)}
                        accessibilityLabel={t('delete')}
                        testID={`delete-saved-${entry.id}`}
                      >
                        <Trash2 size={15} color={COLORS.textMuted} strokeWidth={1.4} />
                      </TouchableOpacity>
                    )}
                  </Animated.View>
                );
              })}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </StarryBackground>
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
  empty: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderStrong,
    backgroundColor: 'rgba(212,175,55,0.04)',
    marginBottom: 18,
  },
  emptyTitle: {
    color: COLORS.text,
    fontFamily: FONTS.serifBold,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyBody: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 26,
    fontStyle: 'italic',
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  emptyCtaText: {
    color: COLORS.bg,
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: 'rgba(21,25,33,0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderStrong,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  cardLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardSign: {
    color: COLORS.gold,
    fontFamily: FONTS.serifBold,
    fontSize: 22,
    marginBottom: 6,
  },
  cardMeta: {
    color: COLORS.textDim,
    fontFamily: FONTS.body,
    fontSize: 12,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  cardNotes: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 6,
  },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: 'rgba(194,122,98,0.08)',
    gap: 12,
  },
  confirmText: {
    color: COLORS.terracotta,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    letterSpacing: 1,
    flex: 1,
  },
  confirmCancel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  confirmCancelText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  confirmDelete: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: COLORS.terracotta,
  },
  confirmDeleteText: {
    color: COLORS.bg,
    fontFamily: FONTS.bodySemi,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
