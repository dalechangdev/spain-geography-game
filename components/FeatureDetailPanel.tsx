import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface FeatureInfo {
  name: string;
  type?: string;
  breadcrumbs: string[];
  stats: { label: string; value: string }[];
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  country: { bg: "#EFF6FF", text: "#1D4ED8" },
  "autonomous community": { bg: "#F5F3FF", text: "#6D28D9" },
  province: { bg: "#FFF7ED", text: "#C2410C" },
  comarca: { bg: "#ECFDF5", text: "#065F46" },
  municipality: { bg: "#F9FAFB", text: "#374151" },
};

function typeBadgeColors(type?: string) {
  if (!type) return { bg: "#F9FAFB", text: "#374151" };
  return TYPE_COLORS[type.toLowerCase()] ?? { bg: "#F0F9FF", text: "#0369A1" };
}

export function parseFeatureInfo(
  properties: Record<string, any>,
): FeatureInfo {
  if (properties.NAME_4) {
    const breadcrumbs: string[] = [];
    if (properties.NAME_3 && properties.NAME_3 !== "NA")
      breadcrumbs.push(properties.NAME_3);
    if (properties.NAME_2) breadcrumbs.push(properties.NAME_2);
    if (properties.NAME_1) breadcrumbs.push(properties.NAME_1);

    const stats: FeatureInfo["stats"] = [];
    if (properties.CC_4 && properties.CC_4 !== "NA")
      stats.push({ label: "Code", value: properties.CC_4 });

    return {
      name: properties.NAME_4,
      type: properties.ENGTYPE_4 || properties.TYPE_4,
      breadcrumbs,
      stats,
    };
  }

  if (properties.NAME_3 && properties.NAME_3 !== "NA") {
    const breadcrumbs: string[] = [];
    if (properties.NAME_2) breadcrumbs.push(properties.NAME_2);
    if (properties.NAME_1) breadcrumbs.push(properties.NAME_1);

    return {
      name: properties.NAME_3,
      type: properties.ENGTYPE_3 || properties.TYPE_3,
      breadcrumbs,
      stats: [],
    };
  }

  if (properties.NAME_2) {
    const stats: FeatureInfo["stats"] = [];
    if (properties.HASC_2 && properties.HASC_2 !== "NA")
      stats.push({ label: "HASC", value: properties.HASC_2 });
    if (properties.CC_2 && properties.CC_2 !== "NA")
      stats.push({ label: "Code", value: properties.CC_2 });

    return {
      name: properties.NAME_2,
      type: properties.ENGTYPE_2 || properties.TYPE_2,
      breadcrumbs: properties.NAME_1 ? [properties.NAME_1] : [],
      stats,
    };
  }

  if (properties.NAME_1) {
    return {
      name: properties.NAME_1,
      type: "Autonomous Community",
      breadcrumbs: properties.COUNTRY ? [properties.COUNTRY] : [],
      stats: [],
    };
  }

  return {
    name: properties.COUNTRY || "Spain",
    type: "Country",
    breadcrumbs: [],
    stats: [],
  };
}

export interface FeatureDetailPanelProps {
  properties: Record<string, any> | null;
  onDismiss: () => void;
}

export function FeatureDetailPanel({
  properties,
  onDismiss,
}: FeatureDetailPanelProps) {
  const translateY = useRef(new Animated.Value(160)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [currentInfo, setCurrentInfo] = useState<FeatureInfo | null>(null);

  useEffect(() => {
    if (properties) {
      setCurrentInfo(parseFeatureInfo(properties));
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 120,
          friction: 14,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 160,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => setCurrentInfo(null));
    }
  }, [properties, translateY, opacity]);

  if (!currentInfo) return null;

  const badgeColors = typeBadgeColors(currentInfo.type);

  return (
    <Animated.View
      style={[styles.panel, { transform: [{ translateY }], opacity }]}
      pointerEvents={properties ? "auto" : "none"}
    >
      <View style={styles.handle} />

      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.name} numberOfLines={2}>
            {currentInfo.name}
          </Text>
          {currentInfo.type && (
            <View
              style={[styles.typeBadge, { backgroundColor: badgeColors.bg }]}
            >
              <Text style={[styles.typeText, { color: badgeColors.text }]}>
                {currentInfo.type}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {currentInfo.breadcrumbs.length > 0 && (
        <View style={styles.breadcrumbRow}>
          <Ionicons
            name="location-outline"
            size={12}
            color="#9CA3AF"
            style={styles.locationIcon}
          />
          {currentInfo.breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <Ionicons
                  name="chevron-forward"
                  size={11}
                  color="#D1D5DB"
                  style={styles.chevron}
                />
              )}
              <Text style={styles.breadcrumb}>{crumb}</Text>
            </React.Fragment>
          ))}
        </View>
      )}

      {currentInfo.stats.length > 0 && (
        <View style={styles.statsRow}>
          {currentInfo.stats.map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  titleBlock: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 24,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 2,
  },
  locationIcon: {
    marginRight: 2,
  },
  chevron: {
    marginHorizontal: 1,
  },
  breadcrumb: {
    fontSize: 13,
    color: "#6B7280",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  statItem: {
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
});
