import axios from "axios";
import { ENV } from "../_core/env";

// M-Pesa Configuration
const MPESA_API_URL = process.env.MPESA_API_URL || "https://sandbox.safaricom.co.ke";
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "your-consumer-key";
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "your-consumer-secret";
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || "174379";
const MPESA_PASSKEY =
  process.env.MPESA_PASSKEY ||
  "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
const MPESA_CALLBACK_URL =
  process.env.MPESA_CALLBACK_URL || "https://api.example.com/api/trpc/payments.mpesaCallback";

let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

/**
 * Get M-Pesa access token with caching
 */
export async function getMpesaAccessToken(): Promise<string> {
  try {
    // Return cached token if still valid
    if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
      return accessToken;
    }

    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString(
      "base64"
    );

    const response = await axios.get(`${MPESA_API_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const token = response.data.access_token as string;
    accessToken = token;
    // Token expires in 3600 seconds, cache for 3500 seconds
    tokenExpiry = new Date(Date.now() + (response.data.expires_in as number) * 1000 - 100000);

    console.log("✓ M-Pesa access token obtained");
    return token;
  } catch (error) {
    console.error("✗ Error getting M-Pesa access token:", error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Format phone number to 254XXXXXXXXX format
 * Handles: +254, 0254, 254, 0 prefixes
 */
function normalizePhoneNumber(phoneNumber: string): string {
  let normalized = phoneNumber.trim();

  // Remove any spaces or dashes
  normalized = normalized.replace(/[\s\-]/g, "");

  // Handle different prefix formats
  if (normalized.startsWith("+254")) {
    normalized = normalized.substring(1); // Remove +
  } else if (normalized.startsWith("0254")) {
    normalized = normalized.substring(1); // Remove leading 0
  } else if (!normalized.startsWith("254")) {
    if (normalized.startsWith("0")) {
      normalized = "254" + normalized.substring(1); // Replace 0 with 254
    } else {
      normalized = "254" + normalized; // Add 254 prefix
    }
  }

  return normalized;
}

/**
 * Generate timestamp in YYYYMMDDHHmmss format
 */
function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Initiate M-Pesa STK Push (Lipa Na M-Pesa Online)
 */
export async function initiateMpesaPayment(
  phoneNumber: string,
  amount: number,
  orderId: number,
  userEmail: string
): Promise<{
  success: boolean;
  checkoutRequestId?: string;
  responseCode?: string;
  message?: string;
  error?: string;
}> {
  try {
    const token = await getMpesaAccessToken();

    // Normalize phone number
    const formattedPhone = normalizePhoneNumber(phoneNumber);

    // Generate timestamp in correct format
    const timestamp = generateTimestamp();

    // Generate password (Base64 encoded: shortcode + passkey + timestamp)
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString(
      "base64"
    );

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: `ORDER-${orderId}`,
      TransactionDesc: `Payment for order ${orderId}`,
      Remark: `SCW Order ${orderId}`,
    };

    const response = await axios.post(
      `${MPESA_API_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✓ M-Pesa STK Push initiated:", response.data);

    return {
      success: response.data.ResponseCode === "0",
      checkoutRequestId: response.data.CheckoutRequestID,
      responseCode: response.data.ResponseCode,
      message: response.data.ResponseDescription,
    };
  } catch (error) {
    console.error(
      "✗ Error initiating M-Pesa payment:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Query M-Pesa transaction status
 */
export async function queryMpesaTransactionStatus(
  checkoutRequestId: string
): Promise<{
  success: boolean;
  resultCode?: string;
  resultDesc?: string;
  data?: unknown;
  error?: string;
}> {
  try {
    const token = await getMpesaAccessToken();

    const timestamp = generateTimestamp();
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString(
      "base64"
    );

    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await axios.post(
      `${MPESA_API_URL}/mpesa/stkpushquery/v1/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: response.data.ResponseCode === "0",
      resultCode: response.data.ResultCode,
      resultDesc: response.data.ResultDesc,
      data: response.data,
    };
  } catch (error) {
    console.error(
      "✗ Error querying M-Pesa transaction status:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate and parse M-Pesa callback
 */
export function validateMpesaCallback(callbackData: unknown): {
  success: boolean;
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
  error?: string;
} {
  try {
    const data = callbackData as Record<string, unknown>;
    const body = (data.Body as Record<string, unknown>)?.stkCallback as Record<string, unknown>;

    if (!body) {
      return {
        success: false,
        error: "Invalid callback structure",
      };
    }

    if (body.ResultCode === 0) {
      // Payment successful
      const metadata = (body.CallbackMetadata as Record<string, unknown>)?.Item as Array<{
        Name: string;
        Value: unknown;
      }>;
      const transactionData: Record<string, unknown> = {};

      if (Array.isArray(metadata)) {
        metadata.forEach((item) => {
          transactionData[item.Name] = item.Value;
        });
      }

      return {
        success: true,
        amount: transactionData.Amount as number,
        mpesaReceiptNumber: transactionData.MpesaReceiptNumber as string,
        transactionDate: transactionData.TransactionDate as string,
        phoneNumber: transactionData.PhoneNumber as string,
      };
    } else {
      // Payment failed
      return {
        success: false,
        error: `Payment failed with code: ${body.ResultCode}`,
      };
    }
  } catch (error) {
    console.error(
      "✗ Error validating M-Pesa callback:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export { normalizePhoneNumber, generateTimestamp };
