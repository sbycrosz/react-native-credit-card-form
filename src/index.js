import connectToState from "./connectToState";
import CCF from "./CreditCardInput";
import LiteCCF from "./LiteCreditCardInput";
import VerticalCCF from "./VerticalCreditCardInput"
import CV from "./CardView";

export const CreditCardInput = connectToState(CCF);
export const LiteCreditCardInput = connectToState(LiteCCF);
export const VerticalCreditCardInput = connectToState(VerticalCCF)
export const CardView = CV;
