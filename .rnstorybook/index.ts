import AsyncStorage from '@react-native-async-storage/async-storage';
import { view } from './storybook.requires';

const safeStorage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Ignore storage errors so Storybook can still render.
    }
  },
};

const StorybookUIRoot = view.getStorybookUI({
  storage: safeStorage,
  enableWebsockets: true,
});

export default StorybookUIRoot;
