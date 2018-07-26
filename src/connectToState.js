import React, { Component } from "react";
import PropTypes from "prop-types";
import CCFieldFormatter from "./CCFieldFormatter";
import CCFieldValidator from "./CCFieldValidator";
import compact from "lodash.compact";

export const InjectedProps = {
  focused: PropTypes.string,
  values: PropTypes.object.isRequired,
  status: PropTypes.object.isRequired,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onBecomeEmpty: PropTypes.func.isRequired,
  onBecomeValid: PropTypes.func.isRequired,
  requiresName: PropTypes.bool,
  requiresCVC: PropTypes.bool,
  requiresPostalCode: PropTypes.bool,
};

export default function connectToState(CreditCardInput) {
  class StateConnection extends Component {
    static propTypes = {
      autoFocus: PropTypes.bool,
      onChange: PropTypes.func.isRequired,
      onFocus: PropTypes.func,
      requiresName: PropTypes.bool,
      requiresCVC: PropTypes.bool,
      requiresPostalCode: PropTypes.bool,
      validatePostalCode: PropTypes.func,
    };

    static defaultProps = {
      autoFocus: false,
      onChange: () => {},
      onFocus: () => {},
      requiresName: false,
      requiresCVC: true,
      requiresPostalCode: false,
      validatePostalCode: (postalCode = "") => {
        return postalCode.match(/^\d{6}$/) ? "valid" :
          postalCode.length > 6 ? "invalid" :
            "incomplete";
      },
    };

    constructor() {
      super();
      this.state = {
        focused: "",
        values: {},
        status: {},
      };
    }

    componentDidMount = () => setTimeout(() => { // Hacks because componentDidMount happens before component is rendered
      this.props.autoFocus && this.focus("number");
    });

    setValues = (values) => {
      const newValues = { ...this.state.values, ...values };
      const displayedFields = this._displayedFields();
      const formattedValues = (new CCFieldFormatter(displayedFields)).formatValues(newValues);
      const validation = (new CCFieldValidator(displayedFields, this.props.validatePostalCode)).validateValues(formattedValues);
      const newState = { values: formattedValues, ...validation };

      this.setState(newState);
      this.props.onChange(newState);
    };

    focus = (field = "number") => {
      this.setState({ focused: field });
    };

    _displayedFields = () => {
      const { requiresName, requiresCVC, requiresPostalCode } = this.props;
      return compact([
        "number",
        "expiry",
        requiresCVC ? "cvc" : null,
        requiresName ? "name" : null,
        requiresPostalCode ? "postalCode" : null,
      ]);
    };

    _focusPreviousField = (field) => {
      const displayedFields = this._displayedFields();
      const fieldIndex = displayedFields.indexOf(field);
      const previousField = displayedFields[fieldIndex - 1];
      if (previousField) this.focus(previousField);
    };

    _focusNextField = (field) => {
      if (field === "name") return;
      // Should not focus to the next field after name (e.g. when requiresName & requiresPostalCode are true
      // because we can't determine if the user has completed their name or not)

      const displayedFields = this._displayedFields();
      const fieldIndex = displayedFields.indexOf(field);
      const nextField = displayedFields[fieldIndex + 1];
      if (nextField) this.focus(nextField);
    };

    _change = (field, value) => {
      this.setValues({ [field]: value });
    };

    _onFocus = (field) => {
      this.focus(field);
      this.props.onFocus(field);
    };

    render() {
      return (
        <CreditCardInput
          {...this.props}
          {...this.state}
          onFocus={this._onFocus}
          onChange={this._change}
          onBecomeEmpty={this._focusPreviousField}
          onBecomeValid={this._focusNextField} />
      );
    }
  }

  return StateConnection;
}
