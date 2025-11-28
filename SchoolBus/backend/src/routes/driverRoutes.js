import express from "express";
import { updateDriver,getDriverById, getDriverIdByUserId, getCurrentTrip} from "../controllers/driverControllers.js";
import { getWeeklySchedule } from "../controllers/driverControllers.js";

// import { getDriverById } from "../controllers/driverControllers.js";
// import { getDriverIdByUserId } from "../controllers/driverControllers.js";
// import { updateDriver } from "../controllers/driverControllers.js";

const router = express.Router();

router.get("/:idtaixe", getDriverById);
router.get("/user_id/:idnguoidung", getDriverIdByUserId);
router.put("/update/:idtaixe", updateDriver);
router.get("/schedule/:idtaixe", getWeeklySchedule);
router.get("/current-trip/:idtaixe", getCurrentTrip);

export default router;