import { Hotkey } from "@spotter-app/core";
import React from "react";
import { FC } from "react";
import { View } from "react-native";
import { SpotterThemeColors } from "../interfaces";
import { HotkeyInput } from "../native/ui/hotkey-input.ui";

export interface SpotterOptionShortcut {
  title: string,
  hotkey?: Hotkey | null,
}

export const ShortcutInput: FC<{
  hotkey?: Hotkey | null,
  onSaveHotkey: (hotkey: Hotkey) => Promise<void>,
  colors?: SpotterThemeColors,
}> = ({
  hotkey,
  onSaveHotkey,
  colors,
}) => {

  return <View style={{display: 'flex'}}>
    <View style={{
      flex: 1,
      backgroundColor: colors?.background,
      marginTop: 5,
      borderRadius: 15,
    }}>
      <HotkeyInput
        styles={{
          padding: 20,
          backgroundColor: 'transparent',
        }}
        hotkey={hotkey}
        onPressHotkey={onSaveHotkey}
      ></HotkeyInput>
    </View>
  </View>
}
