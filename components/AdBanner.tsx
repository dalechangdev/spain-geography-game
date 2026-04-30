import { Platform, StyleSheet, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

const BANNER_UNIT_ID = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.select({
      ios: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      android: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      default: TestIds.ADAPTIVE_BANNER,
    });

export function AdBanner() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_UNIT_ID!}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
