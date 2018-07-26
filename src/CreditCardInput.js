import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactNative, {
  NativeModules,
  View,
  Text,
  Keyboard,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  ViewPropTypes,
} from "react-native";

import CreditCard from "./CardView";
import CCInput from "./CCInput";
import { InjectedProps } from "./connectToState";

const s = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    marginLeft: 25,
  },
  inputLabel: {
    fontWeight: "bold",
  },
  input: {
    height: 40,
  },
});

const CVC_INPUT_WIDTH = 70;
const EXPIRY_INPUT_WIDTH = CVC_INPUT_WIDTH;
const CARD_NUMBER_INPUT_WIDTH_OFFSET = 40;
const CARD_NUMBER_INPUT_WIDTH = Dimensions.get("window").width - EXPIRY_INPUT_WIDTH - CARD_NUMBER_INPUT_WIDTH_OFFSET;
const NAME_INPUT_WIDTH = CARD_NUMBER_INPUT_WIDTH;
const PREVIOUS_FIELD_OFFSET = 40;
const POSTAL_CODE_INPUT_WIDTH = 120;

/* eslint react/prop-types: 0 */ // https://github.com/yannickcr/eslint-plugin-react/issues/106
export default class CreditCardInput extends Component {
  static propTypes = {
    ...InjectedProps,
    labels: PropTypes.object,
    placeholders: PropTypes.object,

    labelStyle: Text.propTypes.style,
    inputStyle: Text.propTypes.style,
    inputContainerStyle: ViewPropTypes.style,

    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    cardImageFront: PropTypes.number,
    cardImageBack: PropTypes.number,
    cardScale: PropTypes.number,
    cardFontFamily: PropTypes.string,
    cardBrandIcons: PropTypes.object,

    allowScroll: PropTypes.bool,

    additionalInputsProps: PropTypes.objectOf(PropTypes.shape(TextInput.propTypes)),
  };

  static defaultProps = {
    cardViewSize: {},
    labels: {
      name: "CARDHOLDER'S NAME",
      number: "CARD NUMBER",
      expiry: "EXPIRY",
      cvc: "CVC/CCV",
      postalCode: "POSTAL CODE",
    },
    placeholders: {
      name: "Full Name",
      number: "1234 5678 1234 5678",
      expiry: "MM/YY",
      cvc: "CVC",
      postalCode: "34567",
    },
    inputContainerStyle: {
      borderBottomWidth: 1,
      borderBottomColor: "black",
    },
    validColor: "",
    invalidColor: "red",
    placeholderColor: "gray",
    allowScroll: false,
    additionalInputsProps: {},
  };

  componentDidMount = () => this._focus(this.props.focused);

  componentWillReceiveProps = (newProps) => {
    if (this.props.focused !== newProps.focused) this._focus(newProps.focused);
  };

  _focus = (field) => {
    console.log("_FOCUS", field);
    if (!field) return;

    const scrollResponder = this.Form.getScrollResponder();
    const nodeHandle = ReactNative.findNodeHandle(this[field]);

    NativeModules.UIManager.measureLayoutRelativeToParent(
      nodeHandle,
      (e) => { throw e; },
      (x) => {
        scrollResponder.scrollTo({ x: Math.max(x - PREVIOUS_FIELD_OFFSET, 0), animated: true });
        this[field].focus();
      },
    );
  }

  onBecomeValid = (onBecomeValid, field) => {
    const { requiresName, requiresCVC, requiresPostalCode } = this.props;
    if (
      (field === "expiry" && !requiresCVC && !requiresName && !requiresPostalCode)
      || (field === "cvc" && !requiresName && !requiresPostalCode)
    ) this.dismissKeyboard();
    return onBecomeValid(field);
  }

  _inputProps = (field) => {
    const {
      inputStyle, labelStyle, validColor, invalidColor, placeholderColor,
      placeholders, labels, values, status,
      onFocus, onChange, onBecomeEmpty, onBecomeValid,
      additionalInputsProps,
    } = this.props;

    return {
      inputStyle: [s.input, inputStyle],
      labelStyle: [s.inputLabel, labelStyle],
      validColor,
      invalidColor,
      placeholderColor,
      ref: this.fieldRef(field),
      field,

      label: labels[field],
      placeholder: placeholders[field],
      value: values[field],
      status: status[field],

      onFocus,
      onChange,
      onBecomeEmpty,
      onBecomeValid: (...args) => this.onBecomeValid(onBecomeValid, ...args),

      additionalInputProps: additionalInputsProps[field],
    };
  };

  dismissKeyboard = () => Keyboard.dismiss()

  scrollViewRef = (ref) => { this.Form = ref; }

  fieldRef = field => (ref) => { this[field] = ref; }

  render() {
    const {
      cardImageFront, cardImageBack, inputContainerStyle,
      values: {
        number, expiry, cvc, name, type, maxNumberLength, maxCodeLength, maxExpiryLength,
      }, focused,
      allowScroll, requiresName, requiresCVC, requiresPostalCode,
      cardScale, cardFontFamily, cardBrandIcons, hidePicture,
    } = this.props;

    return (
      <View style={s.container}>
        {
          hidePicture
          ? null
          :
          <CreditCard
            focused={focused}
            brand={type}
            scale={cardScale}
            fontFamily={cardFontFamily}
            imageFront={cardImageFront}
            imageBack={cardImageBack}
            customIcons={cardBrandIcons}
            name={requiresName ? name : " "}
            number={number}
            expiry={expiry}
            cvc={cvc} />
        }
        <ScrollView
          ref={this.scrollViewRef}
          horizontal
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          scrollEnabled={allowScroll}
          showsHorizontalScrollIndicator
          style={s.form}>
          <CCInput
            {...this._inputProps("number")}
            onBlur={this.dismissKeyboard}
            keyboardType="numeric"
            maxLength={maxNumberLength}
            containerStyle={[s.inputContainer, inputContainerStyle, { width: CARD_NUMBER_INPUT_WIDTH }]} />
          <CCInput
            {...this._inputProps("expiry")}
            onBlur={this.dismissKeyboard}
            maxLength={maxExpiryLength}
            onSubmitEditing={!requiresCVC && !requiresName && !requiresPostalCode ? this.dismissKeyboard : null}
            keyboardType="numeric"
            containerStyle={[s.inputContainer, inputContainerStyle, { width: EXPIRY_INPUT_WIDTH }]} />
          { requiresCVC &&
            <CCInput
              {...this._inputProps("cvc")}
              onBlur={this.dismissKeyboard}
              maxLength={maxCodeLength}
              keyboardType="numeric"
              onSubmitEditing={!requiresName && !requiresPostalCode ? this.dismissKeyboard : null}
              containerStyle={[s.inputContainer, inputContainerStyle, { width: CVC_INPUT_WIDTH }]} /> }
          { requiresName &&
            <CCInput
              {...this._inputProps("name")}
              onBlur={this.dismissKeyboard}
              onSubmitEditing={!requiresPostalCode ? this.dismissKeyboard : null}
              containerStyle={[s.inputContainer, inputContainerStyle, { width: NAME_INPUT_WIDTH }]} /> }
          { requiresPostalCode &&
            <CCInput
              {...this._inputProps("postalCode")}
              onBlur={this.dismissKeyboard}
              onSubmitEditing={this.dismissKeyboard}
              keyboardType="numeric"
              containerStyle={[s.inputContainer, inputContainerStyle, { width: POSTAL_CODE_INPUT_WIDTH }]} /> }
        </ScrollView>
      </View>
    );
  }
}
