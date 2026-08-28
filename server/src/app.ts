import cors from "cors";
import express from "express";
import { paymentRouter } from "./routes/payment.routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "welm-payments-server" });
  });

  app.use("/api/payments", paymentRouter);

  return app;
}
