import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import './global.css';
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and ensures the environment is set up appropriately for Expo (managed/bare).
registerRootComponent(App);
