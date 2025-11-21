import express from "express";
import { getMe, checkStudentExists, getMyChildren,linkStudentToParent } from "../controllers/userControllers.js";

const router = express.Router();

router.get("/me", getMe);
router.get("/check-student", checkStudentExists);
router.get("/my-children", getMyChildren);
router.post("/link-student", linkStudentToParent);

export default router;
