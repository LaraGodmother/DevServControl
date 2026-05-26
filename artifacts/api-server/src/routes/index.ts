import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import servicesRouter from "./services";
import budgetsRouter from "./budgets";
import ordersRouter from "./orders";
import clientsRouter from "./clients";
import appointmentsRouter from "./appointments";
import calendarNotesRouter from "./calendarNotes";
import chatRouter from "./chat";
import companySettingsRouter from "./companySettings";
import scheduleRouter from "./schedule";
import exportsRouter from "./exports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(servicesRouter);
router.use(budgetsRouter);
router.use(ordersRouter);
router.use(clientsRouter);
router.use(appointmentsRouter);
router.use(calendarNotesRouter);
router.use(chatRouter);
router.use(companySettingsRouter);
router.use(scheduleRouter);
router.use(exportsRouter);

export default router;
