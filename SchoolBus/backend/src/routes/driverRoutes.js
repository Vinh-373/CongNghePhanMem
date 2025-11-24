import express from "express";
import { updateDriver,getDriverById, getDriverIdByUserId} from "../controllers/driverControllers.js";
import { getWeeklySchedule } from "../controllers/driverControllers.js";

// import { getDriverById } from "../controllers/driverControllers.js";
// import { getDriverIdByUserId } from "../controllers/driverControllers.js";
// import { updateDriver } from "../controllers/driverControllers.js";

const router = express.Router();

router.get("/:idtaixe", getDriverById);
router.get("/user_id/:idnguoidung", getDriverIdByUserId);
router.put("/update/:idtaixe", updateDriver);
router.get("/schedule/:idtaixe", getWeeklySchedule);

export default router;