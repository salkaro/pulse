export const isProduction = process.env.NODE_ENV === "production";

export const root = isProduction ? "https://pulse.salkaro.com" : "http://localhost:3000"

export const title = "Pulse"
export const shortenedTitle = "PS"