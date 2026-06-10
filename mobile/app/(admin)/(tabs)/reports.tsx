import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, SectionList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import { adminApi } from '../../../src/api/admin.api';
import { Report, ReportStatus } from '../../../src/types';
import { Colors, Spacing, Radius, Shadow } from '../../../src/theme';
import { GradientHeader } from '../../../src/components/ui';

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  PENDING:  { label: 'Pendiente', color: Colors.warning },
  REVIEWED: { label: 'En revisión', color: Colors.info },
  RESOLVED: { label: 'Resuelto',   color: Colors.success },
  REJECTED: { label: 'Rechazado',  color: Colors.textMuted },
};

const TRANSITIONS: Partial<Record<ReportStatus, { label: string; next: ReportStatus; color: string }[]>> = {
  PENDING:  [
    { label: 'Revisar',   next: 'REVIEWED', color: Colors.info },
    { label: 'Rechazar',  next: 'REJECTED', color: Colors.textMuted },
  ],
  REVIEWED: [
    { label: 'Resolver',  next: 'RESOLVED', color: Colors.success },
    { label: 'Rechazar',  next: 'REJECTED', color: Colors.textMuted },
  ],
};

function groupByStatus(reports: Report[]) {
  const order: ReportStatus[] = ['PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED'];
  return order
    .map((status) => ({ status, data: reports.filter((r) => r.status === status) }))
    .filter((s) => s.data.length > 0);
}

export default function AdminReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadReports = useCallback(() => {
    setLoading(true);
    adminApi.getReports({ limit: 100 })
      .then((res) => setReports(res.data))
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los reportes'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadReports);

  const handleTransition = (report: Report, next: ReportStatus) => {
    const isResolve = next === 'RESOLVED';
    Alert.alert(
      isResolve ? '⚠️ Resolver reporte' : 'Confirmar acción',
      isResolve
        ? `Esto desactivará el local "${report.placeId}". ¿Confirmar?`
        : `Cambiar estado a "${STATUS_CONFIG[next].label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: isResolve ? 'destructive' : 'default',
          onPress: async () => {
            setUpdating(report.id);
            try {
              const updated = await adminApi.updateReportStatus(report.id, next);
              setReports((prev) => prev.map((r) => r.id === updated.id ? updated : r));
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message ?? 'No se pudo actualizar');
            } finally {
              setUpdating(null);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
      </SafeAreaView>
    );
  }

  const sections = groupByStatus(reports);
  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;

  return (
    <SafeAreaView style={styles.safe}>
      <GradientHeader dark>
        <Text style={styles.headerTitle}>🚩 Reportes</Text>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</Text>
          </View>
        )}
      </GradientHeader>

      {sections.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>✅</Text>
          <Text style={styles.emptyText}>Sin reportes</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => {
            const cfg = STATUS_CONFIG[section.status];
            return (
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: cfg.color }]} />
                <Text style={[styles.sectionTitle, { color: cfg.color }]}>
                  {cfg.label.toUpperCase()} · {section.data.length}
                </Text>
              </View>
            );
          }}
          renderItem={({ item }) => {
            const transitions = TRANSITIONS[item.status] ?? [];
            const isUpdating = updating === item.id;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardReason}>{item.reason}</Text>
                  <View style={[styles.statusPill, { backgroundColor: STATUS_CONFIG[item.status].color + '22' }]}>
                    <Text style={[styles.statusText, { color: STATUS_CONFIG[item.status].color }]}>
                      {STATUS_CONFIG[item.status].label}
                    </Text>
                  </View>
                </View>
                {item.description ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                ) : null}
                <Text style={styles.cardMeta}>
                  {new Date(item.createdAt).toLocaleDateString('es-CL')}
                </Text>
                {transitions.length > 0 && (
                  <View style={styles.actions}>
                    {isUpdating ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      transitions.map((t) => (
                        <TouchableOpacity
                          key={t.next}
                          style={[styles.actionBtn, { borderColor: t.color }]}
                          onPress={() => handleTransition(item, t.next)}
                        >
                          <Text style={[styles.actionText, { color: t.color }]}>{t.label}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.warmBackground },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: Colors.textMuted, marginTop: Spacing.md },

  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 4 },
  pendingBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  pendingBadgeText: { fontSize: 12, color: 'white', fontWeight: '600' },

  list: { padding: Spacing.md, paddingBottom: 32 },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    marginTop: Spacing.md, marginBottom: Spacing.sm,
  },
  sectionDot:   { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardReason: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.text, marginRight: Spacing.sm },
  statusPill: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  cardMeta: { fontSize: 11, color: Colors.textMuted, marginTop: 6 },

  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionBtn: {
    borderWidth: 1.5, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
  },
  actionText: { fontSize: 13, fontWeight: '700' },
});
