import express, { Application, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
import { indexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/global-error-handler";
import { notFound } from "./app/middlewares/not-found";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import cors from "cors";
import { envVars } from "./app/config/env";
import qs from "qs";
import { PaymentController } from "./app/module/payment/payment.controller";
import cron from "node-cron";
import { AppointmentService } from "./app/module/appointment/appointment.service";

const app: Application = express();

app.set("query parser", (str: string) => qs.parse(str));

// set template engine
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "src/app/templates"));

// cors
app.use(cors({
  origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorizationn"]
}));

// stripe webhook
app.post("/webhook", express.raw({type: "application/json"}), PaymentController.handleStripeWebhookEvent);

// better auth 
app.use("/api/auth", toNodeHandler(auth));

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// cancel unpaid appoints as cron job
cron.schedule("*/25 * * * *", async () => {
  try {
    console.log("Running cron job to cancel unpaid appointments...");
    await AppointmentService.cancelUnpaidAppointments();
  } catch (error : any) {
    console.error("Error running cron job to cancel unpaid appointments:", error);
  }
})

app.use("/api/v1", indexRoutes)

// Basic route
app.get('/', async (req: Request, res: Response) => {
  const specialty = await prisma.specialty.create({
    data: {
      title : "Cardiology"
    }
  })
  res.status(201).json({
    success: true,
    message: "API is working",
    data: specialty
  })
});

app.use(globalErrorHandler);
app.use(notFound)

export default app;