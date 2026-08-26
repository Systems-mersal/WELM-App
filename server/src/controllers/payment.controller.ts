import type { Request, Response } from "express";
import { createPaymentIntent } from "../services/stripe.service";

interface CreateIntentBody {
  amount?: unknown;
  currency?: unknown;
}

export async function createIntent(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateIntentBody;
  const amount = Number(body.amount);
  const currency =
    typeof body.currency === "string" ? body.currency.trim().toLowerCase() : "";

  if (!Number.isInteger(amount) || amount <= 0) {
    res.status(400).json({
      error: "invalid_amount",
      message: "amount must be a positive integer in the smallest currency unit (e.g. cents).",
    });
    return;
  }

  if (!currency || currency.length !== 3) {
    res.status(400).json({
      error: "invalid_currency",
      message: "currency must be a 3-letter ISO code (e.g. sar, usd).",
    });
    return;
  }

  try {
    const result = await createPaymentIntent({ amount, currency });
    res.status(200).json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create PaymentIntent.";
    console.error("[payments] create-intent failed:", message);
    res.status(502).json({
      error: "stripe_error",
      message,
    });
  }
}
