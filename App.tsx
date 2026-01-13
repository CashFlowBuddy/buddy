import {NavigationContainer} from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigation';
import {PaperProvider} from 'react-native-paper';

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
