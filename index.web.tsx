// at project-root/index.web.tsx

import 'react-native-gesture-handler';        // if you use it
import './assets/styles/news-list.web.css';   // ← only webpack (web) sees this
import { registerRootComponent } from 'expo';
import App from './app/index';

registerRootComponent(App);
