import express from "express";
import { getMe, checkStudentExists, getMyChildren,linkStudentToParent, getSchedulesByMyChildren, addRegisteredPoint } from "../controllers/userControllers.js";

const router = express.Router();

router.get("/me", getMe);
router.get("/check-student", checkStudentExists);
router.get("/my-children", getMyChildren);
router.post("/link-student", linkStudentToParent);
router.get("/schedules-by-my-children", getSchedulesByMyChildren);
router.post("/register-pickup-point/:iddiemdung", addRegisteredPoint);

export default router;
