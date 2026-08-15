/**
 * Razorpay checkout helpers. The checkout script is loaded lazily from the CDN
 * the first time a payment starts (never on page load) and the resolved
 * `Razorpay` constructor is cached for subsequent payments.
 */

let scriptPromise = null;

export const loadRazorpay = () => {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () =>
      window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Razorpay failed to initialise."));
    script.onerror = () => {
      scriptPromise = null; // allow retry on a later attempt
      reject(new Error("Could not load the payment gateway. Please check your connection."));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
};
