import React, { Component, PropTypes } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const s = StyleSheet.create({
  baseInputStyle: {
    color: "black",
  },
});

export default class CCInput extends Component {
  static propTypes = {
    field: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    keyboardType: PropTypes.string,
    autoFocus: PropTypes.bool,

    status: PropTypes.oneOf(["valid", "invalid", "incomplete"]),

    containerStyle: View.propTypes.style,
    inputStyle: Text.propTypes.style,
    labelStyle: Text.propTypes.style,
    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    onFocus: PropTypes.func,
    onChange: PropTypes.func,
    onBecomeEmpty: PropTypes.func,
    onBecomeValid: PropTypes.func,
    additionalInputProps: PropTypes.shape(TextInput.propTypes),
  };

  static defaultProps = {
    label: "",
    value: "",
    status: "incomplete",
    keyboardType: "numeric",
    autoFocus: false,
    containerStyle: {},
    inputStyle: {},
    labelStyle: {},
    onFocus: () => {},
    onChange: () => {},
    onBecomeEmpty: () => {},
    onBecomeValid: () => {},
    additionalInputProps: {},
  };

  componentWillReceiveProps = newProps => {
    const { status, value, onBecomeEmpty, onBecomeValid, field } = this.props;
    const { status: newStatus, value: newValue } = newProps;

    if (value !== "" && newValue === "") onBecomeEmpty(field);
    if (status !== "valid" && newStatus === "valid") onBecomeValid(field);
  };

  focus = () => this.refs.input.focus();

  _onFocus = () => this.props.onFocus(this.props.field);
  _onChange = value => this.props.onChange(this.props.field, value);

  render() {
    const { label, value, placeholder, status, keyboardType,
            containerStyle, inputStyle, labelStyle,
            validColor, invalidColor, placeholderColor,
            additionalInputProps, autoFocus } = this.props;
    return (
      <TouchableOpacity onPress={this.focus}
          activeOpacity={0.99}>
        <View style={[containerStyle]}>
          { !!label && <Text style={[labelStyle]}>{label}</Text>}
          <TextInput ref="input"
              {...additionalInputProps}
              autoFocus={autoFocus}
              keyboardType={keyboardType}
              autoCapitalise="words"
              autoCorrect={false}
              style={[
                s.baseInputStyle,
                inputStyle,
                ((validColor && status === "valid") ? { color: validColor } :
                 (invalidColor && status === "invalid") ? { color: invalidColor } :
                 {}),
              ]}
              underlineColorAndroid={"transparent"}
              placeholderTextColor={placeholderColor}
              placeholder={placeholder}
              value={value}
              onFocus={this._onFocus}
              onChangeText={this._onChange} />
        </View>
      </TouchableOpacity>
    );
  }
}
