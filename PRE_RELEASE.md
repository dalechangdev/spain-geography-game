# Pre-Production Release Checklist

## 1. AdMob Setup

- [ ] Create an AdMob account at https://admob.google.com
- [ ] Register the iOS app (bundle ID: `com.dalechang.spaingeography`)
- [ ] Register the Android app (package: `com.dalechang.spaingeography`)
- [ ] Create a Banner ad unit for each platform
- [ ] Replace test app IDs in `app.json` with real AdMob app IDs:
  - `android.googleMobileAdsAppId`
  - `ios.googleMobileAdsAppId`
- [ ] Replace placeholder unit IDs in `components/AdBanner.tsx` with real banner unit IDs for iOS and Android

## 2. GDPR / Privacy Consent (Required for EU users)

- [ ] Enable UMP (User Messaging Platform) in AdMob console under Privacy & Messaging
- [ ] Implement consent flow using `react-native-google-mobile-ads` UMP API before showing ads
- [ ] Test consent form in a simulated EU geography (AdMob console has a test tool)

## 3. App Store Accounts

- [ ] Apple Developer account ($99/year) — https://developer.apple.com
- [ ] Google Play Developer account ($25 one-time) — https://play.google.com/console

## 4. App Store Metadata

- [ ] App name, subtitle, description (English + Spanish recommended)
- [ ] Keywords for App Store (iOS)
- [ ] Screenshots for required device sizes (iPhone 6.9", 6.5", iPad if supporting tablets)
- [ ] App icon (already configured in `app.json`)
- [ ] Privacy policy URL (required — AdMob mandates one)

## 5. Build Configuration

- [ ] Set `NODE_ENV=production` / confirm `__DEV__` is false in release builds
- [ ] Bump version in `app.json` (`version`, `ios.buildNumber`, `android.versionCode`)
- [ ] Run `npm run lint` and fix any errors

## 6. Production Builds

- [ ] iOS: `eas build --platform ios --profile production` (requires EAS CLI and Apple credentials)
- [ ] Android: `eas build --platform android --profile production`
- [ ] Or use local builds: `npm run ios` / `npm run android` in release mode

## 7. Pre-Submit Testing

- [ ] Verify banner ad renders on Explore tab (real device, production build)
- [ ] Verify no crash on cold start
- [ ] Verify map loads correctly
- [ ] Verify quiz flow works end-to-end
- [ ] Test on both iOS and Android

## 8. Submission

- [ ] Submit iOS build via Xcode or Transporter → App Store Connect review
- [ ] Submit Android APK/AAB via Google Play Console → review
- [ ] Monitor for review rejection reasons (AdMob, privacy policy, and permissions are common flags)

## Notes

- Real AdMob revenue only starts after apps are approved and live — test ads show during development
- AdMob payments require a verified payment profile and minimum $100 threshold before payout
- Apple review typically takes 1–3 days; Google Play 1–7 days for new apps
