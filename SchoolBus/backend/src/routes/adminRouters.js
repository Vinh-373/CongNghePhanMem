import express from "express";
import upload from "../middleware/upload.js";
import { getAllStudents, addStudent, getAllVehicles, addVehicle, getAllRoutes } from "../controllers/adminControllers.js";
const router = express.Router();

router.get("/get-all-students", getAllStudents);
router.post("/add-student", upload.single("anhdaidien"), addStudent);
router.post("/add-vehicle", addVehicle);
router.get("/get-all-vehicles", getAllVehicles);
router.get("/get-all-routes", getAllRoutes);
export default router;