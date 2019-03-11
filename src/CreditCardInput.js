import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactNative, {
  NativeModules,
  View,
  Text,
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
  verticalForm: {
    marginTop: 20,
  },
  verticalFormRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputContainer: {
    marginLeft: 20,
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

    formStyle: ViewPropTypes.style,
    verticalFormRowStyle: ViewPropTypes.style,
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

    verticalForm: PropTypes.bool,
    verticalFormRows: PropTypes.array,
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

  componentWillReceiveProps = newProps => {
    if (this.props.focused !== newProps.focused) this._focus(newProps.focused);
  };

  _focus = field => {
    const { verticalForm } = this.props;

    if (!field) return;

    const scrollResponder = this.refs.Form.getScrollResponder();
    const nodeHandle = ReactNative.findNodeHandle(this.refs[field]);

    if (!verticalForm) {
      NativeModules.UIManager.measureLayoutRelativeToParent(nodeHandle,
        e => { throw e; },
        x => {
          scrollResponder.scrollTo({ x: Math.max(x - PREVIOUS_FIELD_OFFSET, 0), animated: true });
          this.refs[field].focus();
        });
    }
  }

  _inputProps = field => {
    const {
      inputStyle, labelStyle, validColor, invalidColor, placeholderColor,
      placeholders, labels, values, status,
      onFocus, onChange, onBecomeEmpty, onBecomeValid,
      additionalInputsProps,
    } = this.props;

    return {
      inputStyle: [s.input, inputStyle],
      labelStyle: [s.inputLabel, labelStyle],
      validColor, invalidColor, placeholderColor,
      ref: field, field,

      label: labels[field],
      placeholder: placeholders[field],
      value: values[field],
      status: status[field],

      onFocus, onChange, onBecomeEmpty, onBecomeValid,

      additionalInputProps: additionalInputsProps[field],
    };
  };

  renderField = (fieldName, fieldWidth) => {
    const { inputContainerStyle } = this.props;

    switch (fieldName) {
      case "number":
        return (
          <CCInput {...this._inputProps(fieldName)}
            key={fieldName}
            keyboardType="numeric"
            containerStyle={[
              s.inputContainer, inputContainerStyle,
              { width: fieldWidth || CARD_NUMBER_INPUT_WIDTH }]} />
        );
      case "expiry":
        return (
          <CCInput {...this._inputProps(fieldName)}
            key={fieldName}
            keyboardType="numeric"
            containerStyle={[
              s.inputContainer,
              inputContainerStyle, { width: fieldWidth || EXPIRY_INPUT_WIDTH }]} />
        );
      case "cvc":
        return (
          <CCInput {...this._inputProps(fieldName)}
            key={fieldName}
            keyboardType="numeric"
            containerStyle={[s.inputContainer, inputContainerStyle, { width: fieldWidth || CVC_INPUT_WIDTH }]} />
        );
      case "name":
        return (
          <CCInput {...this._inputProps(fieldName)}
            key={fieldName}
            containerStyle={[s.inputContainer, inputContainerStyle, { width: fieldWidth || NAME_INPUT_WIDTH }]} />
        );
      case "postalCode":
        return (
          <CCInput {...this._inputProps("postalCode")}
            key={fieldName}
            keyboardType="numeric"
            containerStyle={[s.inputContainer, inputContainerStyle, { width: fieldWidth || POSTAL_CODE_INPUT_WIDTH }]} />
        );
      default:
        return null;
    }
  }

  renderVerticalForm = () => {
    const { formStyle, verticalFormRowStyle, verticalFormRows } = this.props;

    return (
      <ScrollView
        ref="Form"
        horizontal={false}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        style={[s.verticalForm, formStyle]}>
        { verticalFormRows.map((row, index) => (
          <View style={[s.verticalFormRow, verticalFormRowStyle]} key={index}>
            { row.fields.map((field) => (
              this.renderField(field.name, field.width)
            ))}
          </View>
        ))}
      </ScrollView>
    );
  }

  renderHorizontalForm = () => {
    const { formStyle, allowScroll, requiresName, requiresCVC, requiresPostalCode } = this.props;

    return (
      <ScrollView
        ref="Form"
        horizontal
        keyboardShouldPersistTaps="always"
        scrollEnabled={allowScroll}
        showsHorizontalScrollIndicator={false}
        style={[s.form, formStyle]}>
        { this.renderField("number") }
        { this.renderField("expiry") }
        { requiresCVC && this.renderField("cvc") }
        { requiresName && this.renderField("name") }
        { requiresPostalCode && this.renderField("postalCode") }
      </ScrollView>
    );
  }

  renderForm = () => (
    this.props.verticalForm ?
      this.renderVerticalForm()
      :
      this.renderHorizontalForm()
  )

  render() {
    const {
      cardImageFront, cardImageBack, values: { number, expiry, cvc, name, type },
      focused, requiresName, cardScale, cardFontFamily, cardBrandIcons,
    } = this.props;

    return (
      <View style={s.container}>
        <CreditCard focused={focused}
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

          { this.renderForm() }
      </View>
    );
  }
}
