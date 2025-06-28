import React from 'react';
import NewsListScreen from '@/components/NewsListScreen';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#242424' }}>
        <NewsListScreen />
      </SafeAreaView>
    </>
  );
}