import { Router } from "express";
import { createIntent } from "../controllers/payment.controller";

export const paymentRouter = Router();

paymentRouter.post("/create-intent", (req, res) => {
  void createIntent(req, res);
});
