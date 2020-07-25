import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

const App = () => {
  const HotkeysEvents = new NativeEventEmitter(NativeModules.Hotkeys);
  HotkeysEvents.addListener('onEvent', (res) => console.log('event', res));
  NativeModules.Hotkeys.emit();
  console.log('CALLED', NativeModules.Hotkeys);

  return (
    <>
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <Text>Settings</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

// const styles = StyleSheet.create({});

export default App;
