import React from 'react';
import { requireNativeComponent, TextStyle } from 'react-native';

const RNInput = requireNativeComponent<any>('RNInput');

type InputProps = {
  value: string,
  placeholder: string,
  disabled?: boolean,
  fontSize?: number,
  style?: TextStyle,
  onChangeText?: (text: string) => void,
  onSubmit?: () => void,
  onEscape?: () => void,
  onArrowDown?: () => void,
  onArrowUp?: () => void,
  onCommandComma?: () => void,
  onTab?: () => void,
  onShiftTab?: () => void,
  onShiftEnter?: () => void,
  onBackspace?: (text: string) => void,
}

export class InputNative extends React.PureComponent<InputProps> {

  _onChangeText = (event: { nativeEvent: { text: string }}) => {
    if (!this.props.onChangeText) {
      return;
    }
    this.props.onChangeText(event?.nativeEvent?.text)
  }

  _onSubmit = () => {
    if (!this.props.onSubmit) {
      return;
    }
    this.props.onSubmit()
  }

  _onEscape = () => {
    if (!this.props.onEscape) {
      return;
    }
    this.props.onEscape()
  }

  _onArrowDown = () => {
    if (!this.props.onArrowDown) {
      return;
    }
    this.props.onArrowDown()
  }

  _onArrowUp = () => {
    if (!this.props.onArrowUp) {
      return;
    }
    this.props.onArrowUp()
  }

  _onCommandComma = () => {
    if (!this.props.onCommandComma) {
      return;
    }
    this.props.onCommandComma()
  }

  _onTab = () => {
    if (!this.props.onTab) {
      return;
    }
    this.props.onTab()
  }

  _onShiftTab = () => {
    if (!this.props.onShiftTab) {
      return;
    }
    this.props.onShiftTab()
  }

  _onShiftEnter = () => {
    if (!this.props.onShiftEnter) {
      return;
    }
    this.props.onShiftEnter()
  }

  _onBackspace = (event: { nativeEvent: { text: string } }) => {
    if (!this.props.onBackspace) {
      return;
    }
    this.props.onBackspace(event.nativeEvent.text)
  }

  render() {
    const nativeProps = {
      ...this.props,
      onChangeText: this._onChangeText,
      onSubmit: this._onSubmit,
      onEscape: this._onEscape,
      onArrowDown: this._onArrowDown,
      onArrowUp: this._onArrowUp,
      onCommandComma: this._onCommandComma,
      onTab: this._onTab,
      onShiftTab: this._onShiftTab,
      onShiftEnter: this._onShiftEnter,
      onBackspace: this._onBackspace,
    }

    return <RNInput
      {...nativeProps}
      style={{ padding: 17, backgroundColor: 'transparent', ...(this.props.style ? this.props.style : {})}}
    />
  }
}
