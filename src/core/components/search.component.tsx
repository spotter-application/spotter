import React from 'react';
import { StyleProp, TextInput, TextStyle } from 'react-native';

type SearchProps = {
  value: string;
  placeholder: string;
  onSubmit: () => void;
  onChange: (text: string) => void;
  style: StyleProp<TextStyle>;
}

export const Search = ({ value, placeholder, onSubmit, onChange, style }: SearchProps) => (
  <TextInput
    value={value}
    placeholder={placeholder}
    style={style}
    onSubmitEditing={onSubmit}
    onChangeText={onChange}
    autoCorrect={false}
    autoFocus={true}
  ></TextInput>
);
