import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

type SearchProps = {
  value: string;
  placeholder: string;
  onSubmit: () => void;
  onChange: (text: string) => void;
}

export const Search = ({ value, placeholder, onSubmit, onChange }: SearchProps) => (
  <TextInput
    value={value}
    placeholder={placeholder}
    style={styles.input}
    onSubmitEditing={onSubmit}
    onChangeText={onChange}
    autoCorrect={false}
    autoFocus={true}
  ></TextInput>
);

const styles = StyleSheet.create({
  input: {
    padding: 15,
    fontSize: 18,
    backgroundColor: '#000',
    elevation: 0,
    borderRadius: 10,
    borderWidth: 5,
    borderColor: '#000',
  },
});
