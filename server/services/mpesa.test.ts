import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  normalizeMpesaPhoneNumber,
  generateMpesaTimestamp,
  validateMpesaCallback,
} from "./mpesa";

describe("M-Pesa Service", () => {
  describe("normalizeMpesaPhoneNumber", () => {
    it("should convert +254 format to 254 format", () => {
      const result = normalizeMpesaPhoneNumber("+254712345678");
      expect(result).toBe("254712345678");
    });

    it("should convert 0254 format to 254 format", () => {
      const result = normalizeMpesaPhoneNumber("0254712345678");
      expect(result).toBe("254712345678");
    });

    it("should keep 254 format as is", () => {
      const result = normalizeMpesaPhoneNumber("254712345678");
      expect(result).toBe("254712345678");
    });

    it("should convert 0 prefix to 254", () => {
      const result = normalizeMpesaPhoneNumber("0712345678");
      expect(result).toBe("254712345678");
    });

    it("should handle spaces and dashes", () => {
      const result = normalizeMpesaPhoneNumber("+254 712-345-678");
      expect(result).toBe("254712345678");
    });

    it("should throw error for invalid phone number", () => {
      expect(() => normalizeMpesaPhoneNumber("invalid")).toThrow();
    });

    it("should throw error for too short number", () => {
      expect(() => normalizeMpesaPhoneNumber("123")).toThrow();
    });
  });

  describe("generateMpesaTimestamp", () => {
    it("should generate timestamp in YYYYMMDDHHmmss format", () => {
      const timestamp = generateMpesaTimestamp();
      expect(timestamp).toMatch(/^\d{14}$/);
    });

    it("should generate valid timestamp for a specific date", () => {
      const date = new Date("2026-04-22T14:30:45Z");
      const timestamp = generateMpesaTimestamp(date);
      expect(timestamp).toBe("20260422143045");
    });

    it("should generate timestamp with correct length", () => {
      const timestamp = generateMpesaTimestamp();
      expect(timestamp.length).toBe(14);
    });

    it("should generate increasing timestamps", () => {
      const ts1 = generateMpesaTimestamp();
      const ts2 = generateMpesaTimestamp();
      expect(parseInt(ts2)).toBeGreaterThanOrEqual(parseInt(ts1));
    });
  });

  describe("validateMpesaCallback", () => {
    it("should validate successful callback", () => {
      const callback = {
        Body: {
          stkCallback: {
            MerchantRequestID: "test-123",
            CheckoutRequestID: "test-456",
            ResultCode: 0,
            ResultDesc: "The service request has been processed successfully.",
            CallbackMetadata: {
              Item: [
                { Name: "Amount", Value: 1000 },
                { Name: "MpesaReceiptNumber", Value: "LIJ123456789" },
                { Name: "TransactionDate", Value: 20260422143045 },
                { Name: "PhoneNumber", Value: 254712345678 },
              ],
            },
          },
        },
      };

      const result = validateMpesaCallback(callback);
      expect(result.success).toBe(true);
      expect(result.resultCode).toBe(0);
    });

    it("should handle failed callback", () => {
      const callback = {
        Body: {
          stkCallback: {
            MerchantRequestID: "test-123",
            CheckoutRequestID: "test-456",
            ResultCode: 1,
            ResultDesc: "The service request was cancelled by user",
          },
        },
      };

      const result = validateMpesaCallback(callback);
      expect(result.success).toBe(false);
      expect(result.resultCode).toBe(1);
    });

    it("should extract metadata correctly", () => {
      const callback = {
        Body: {
          stkCallback: {
            MerchantRequestID: "test-123",
            CheckoutRequestID: "test-456",
            ResultCode: 0,
            ResultDesc: "Success",
            CallbackMetadata: {
              Item: [
                { Name: "Amount", Value: 5000 },
                { Name: "MpesaReceiptNumber", Value: "ABC987654321" },
                { Name: "TransactionDate", Value: 20260422143045 },
                { Name: "PhoneNumber", Value: 254712345678 },
              ],
            },
          },
        },
      };

      const result = validateMpesaCallback(callback);
      expect(result.amount).toBe(5000);
      expect(result.receiptNumber).toBe("ABC987654321");
      expect(result.phoneNumber).toBe(254712345678);
    });

    it("should handle missing metadata", () => {
      const callback = {
        Body: {
          stkCallback: {
            MerchantRequestID: "test-123",
            CheckoutRequestID: "test-456",
            ResultCode: 0,
            ResultDesc: "Success",
          },
        },
      };

      const result = validateMpesaCallback(callback);
      expect(result.success).toBe(true);
      expect(result.amount).toBeUndefined();
    });

    it("should handle invalid callback structure", () => {
      const callback = { invalid: "structure" };
      expect(() => validateMpesaCallback(callback)).toThrow();
    });
  });
});
