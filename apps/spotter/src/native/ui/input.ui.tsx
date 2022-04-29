import React from 'react';
import { requireNativeComponent, Text, TextStyle, View } from 'react-native';

const RNInput = requireNativeComponent<any>('RNInput');

type InputProps = {
  value: string,
  placeholder: string,
  fontSize?: number,
  color?: string,
  background?: string,
  hint?: string,
  style?: TextStyle,
  onChangeText?: (text: string) => void,
  onSubmit?: () => void,
  onEscape?: () => void,
  onArrowDown?: () => void,
  onArrowUp?: () => void,
  onCommandKey?: (key: number) => void,
  onTab?: () => void,
  onShiftTab?: () => void,
  onShiftEnter?: () => void,
  onBackspace?: (text: string) => void,
};

const centeredTextStyles: TextStyle = {
  position: 'absolute',
  top: 2,
  bottom: 0,
  left: 2,
  margin: 'auto',
  fontSize: 26,
  zIndex: 2,
};

export class Input extends React.PureComponent<InputProps> {

  _onChangeText = (event: { nativeEvent: { text: string }}) => {
    if (!this.props.onChangeText) {
      return;
    }
    this.props.onChangeText(event?.nativeEvent?.text);
  }

  _onSubmit = () => {
    if (!this.props.onSubmit) {
      return;
    }
    this.props.onSubmit();
  }

  _onEscape = () => {
    if (!this.props.onEscape) {
      return;
    }
    this.props.onEscape();
  }

  _onArrowDown = () => {
    if (!this.props.onArrowDown) {
      return;
    }
    this.props.onArrowDown();
  }

  _onArrowUp = () => {
    if (!this.props.onArrowUp) {
      return;
    }
    this.props.onArrowUp();
  }

  _onCommandKey = (event: { nativeEvent: { key: number}}) => {
    if (!this.props.onCommandKey) {
      return;
    }
    this.props.onCommandKey(event.nativeEvent.key);
  }

  _onTab = () => {
    if (!this.props.onTab) {
      return;
    }
    this.props.onTab();
  }

  _onShiftTab = () => {
    if (!this.props.onShiftTab) {
      return;
    }
    this.props.onShiftTab();
  }

  _onShiftEnter = () => {
    if (!this.props.onShiftEnter) {
      return;
    }
    this.props.onShiftEnter();
  }

  _onBackspace = (event: { nativeEvent: { text: string } }) => {
    if (!this.props.onBackspace) {
      return;
    }
    this.props.onBackspace(event.nativeEvent.text);
  }

  render() {
    const nativeProps = {
      ...this.props,
      onChangeText: this._onChangeText,
      onSubmit: this._onSubmit,
      onEscape: this._onEscape,
      onArrowDown: this._onArrowDown,
      onArrowUp: this._onArrowUp,
      onCommandKey: this._onCommandKey,
      onTab: this._onTab,
      onShiftTab: this._onShiftTab,
      onShiftEnter: this._onShiftEnter,
      onBackspace: this._onBackspace,
      placeholder: '',
    }

    return <View style={{
      position: 'relative',
      flex: 1,
      backgroundColor: 'transparent',
      marginTop: 2,
      marginLeft: 0,
      marginRight: 20,
    }}>
      <RNInput {...nativeProps} style={{ padding: 18, top: 2 }} />
      {(this.props.placeholder && !this.props.value) &&
        <Text
          style={{
            ...centeredTextStyles,
            ...this.props.style,
            left: 2,
            opacity: 0.3,
            zIndex: 1,
          }}
        >
          {this.props.placeholder}
        </Text>
      }
      {this.props.hint &&
        <Text
          style={{
            ...centeredTextStyles,
            ...this.props.style,
            opacity: 0.3,
            zIndex: 1,
          }}
        >
          {this.props.hint}
        </Text>
      }
    </View>
  }
}
