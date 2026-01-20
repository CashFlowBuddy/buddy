import '../global.css';

import { PortalHost } from '@rn-primitives/portal';
import * as React from 'react';
import { View } from 'react-native';

/**
 * Root layout placeholder for react-native-reusables doctor.
 * This project uses React Navigation via App.tsx (not Expo Router),
 * but the reusables tooling expects a root layout file.
 */
export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <PortalHost name="rootPortal" />
    </View>
  );
}
