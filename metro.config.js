// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

module.exports = withStorybook(withNativeWind(config, { input: './global.css', inlineRem: 16 }), {
	enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
});
