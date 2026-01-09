import { isProduction } from "./site";

export const starterPriceId = isProduction ? "1" : "";
export const essentialPriceId = isProduction ? "2" : "";
export const proPriceId = isProduction ? "3" : "";