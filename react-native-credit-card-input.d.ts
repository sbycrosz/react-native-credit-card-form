declare module "react-native-credit-card-input" {
  import {
    StyleProp,
    TextInputProps,
    Text,
    TextInput,
    View
  } from "react-native";

  interface CardViewProps {
    focused?: string; // Determines the front face of the card
    brand?: string; // Brand of the credit card
    name?: string; // Cardholder's name (Use empty string if you need to hide the placeholder)
    number?: string; // Credit card number (you'll need to the formatting yourself)
    expiry?: string; // Credit card expiry (should be in MM/YY format)
    cvc?: string; //	Credit card CVC
    placeholder?: object; //	Placeholder texts
    scale?: number; // Scales the card
    fontFamily?: string; // Defaults to Courier and monospace in iOS and Android respectively
    imageFront?: number; // Image for the credit-card
    imageBack?: number; // Image for the credit-card
    customIcons?: object; //	brand icons for CardView. see ./src/Icons.js for details
  }

  interface CardPlaceHolderFields {
    // Defaults to { number: "1234 5678 1234 5678", expiry: "MM/YY", cvc: "CVC" }
    number: string;
    expiry: string;
    cvc: string;
  }

  interface LiteCreditCardInputProps {
    autoFocus?: boolean; // Automatically focus Card Number field on render
    onChange?: (formData: any) => void; // Receives a formData object every time the form changes
    onFocus?: (fieldName: string) => void; // Receives the name of currently focused field
    placeholders?: CardPlaceHolderFields;
    placeholderColor?: string; // Color that will be applied for text input placeholder. Defaults to: "gray"
    inputStyle?: StyleProp<TextInput>; // Style for credit-card form's textInput
    validColor?: string; // Color that will be applied for valid text input. Defaults to: "{inputStyle.color}"
    invalidColor?: string; //Color that will be applied for invalid text input. Defaults to: "red"
    additionalInputsProps?: TextInputProps; // Allows you to change all props documented in RN TextInput.
  }

  interface CreditCardInputProps extends LiteCreditCardInputProps {
    labels?: CardPlaceHolderFields; //	Defaults to { number: "CARD NUMBER", expiry: "EXPIRY", cvc: "CVC/CCV" }
    cardScale?: number; //	Scales the credit-card view. Defaults to 1, which translates to { width: 300, height: 190 }
    cardFontFamily?: string; // Font family for the CreditCardView, works best with monospace fonts. Defaults to Courier (iOS) or monospace (android)
    cardImageFront?: number; // Image for the credit-card view e.g. require("./card.png")
    cardImageBack?: number; // Image for the credit-card view e.g. require("./card.png")
    labelStyle?: StyleProp<Text>; // Style for credit-card form's labels
    inputContainerStyle?: StyleProp<View>; // Style for textInput's container - Defaults to: { borderBottomWidth: 1, borderBottomColor: "black" }

    requiresName?: boolean; // Shows cardholder's name field, defaults to false
    requiresCVC?: boolean; // Shows CVC field, defaults to true
    requiresPostalCode?: boolean; // Shows postalCode field Default to false
    validatePostalCode?: (
      postCode: string
    ) => "incomplete" | "valid" | "invalid"; // Function to validate postalCode
    allowScroll?: boolean; // enables horizontal scrolling on CreditCardInput Defaults to false
    cardBrandIcons?: object; // brand icons for CardView. see ./src/Icons.js for details
  }

  class CreditCardInput extends React.Component<CreditCardInputProps> {}
  class LiteCreditCardInput extends React.Component<LiteCreditCardInputProps> {}
  class CardView extends React.Component<CardViewProps> {}

  export { CreditCardInput, LiteCreditCardInput, CardView };
}
