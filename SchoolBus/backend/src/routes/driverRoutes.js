import express from "express";
import { updateDriver,getDriverById,getWeeklySchedule, getDriverIdByUserId, getCurrentTrip, putStudentStatus, putTripStatus, updateDriverLocation,getNotificationByUser, addNotification,getStudentsByIds} from "../controllers/driverControllers.js";

// import { getDriverById } from "../controllers/driverControllers.js";
// import { getDriverIdByUserId } from "../controllers/driverControllers.js";
// import { updateDriver } from "../controllers/driverControllers.js";

const router = express.Router();

router.get("/user_id/:idnguoidung", getDriverIdByUserId);
router.put("/update/:idtaixe", updateDriver);
router.get("/schedule/:idtaixe", getWeeklySchedule);
router.get("/current-trip/:idtaixe", getCurrentTrip);
router.put("/student-status", putStudentStatus);
router.put("/trip-status", putTripStatus);
router.put("/update-location", updateDriverLocation);
router.get("/notification/:idnguoidung", getNotificationByUser)
router.post('/add-notification', addNotification)
router.get("/students-by-ids", getStudentsByIds);
router.get("/:idtaixe", getDriverById);


export default router;