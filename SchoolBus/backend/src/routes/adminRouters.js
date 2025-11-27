import express from "express";
import upload from "../middleware/upload.js";
import { getAllStudents, addStudent, getAllVehicles, addVehicle, getAllRoutes, getAllParents, addParent, getAllDrivers, addDriver,getAllPickupPoints,addPickupPoint,getAllSchadules, addSchedule,getAllRegisteredPickupPoints, addRoute, getInfoDashboard } from "../controllers/adminControllers.js";
const router = express.Router();

router.get("/get-all-students", getAllStudents);
router.post("/add-student", upload.single("anhdaidien"), addStudent);
router.post("/add-vehicle", addVehicle);
router.get("/get-all-vehicles", getAllVehicles);
router.get("/get-all-routes", getAllRoutes);
router.post("/add-route", addRoute);
router.get("/get-all-parents", getAllParents);
router.post("/add-parent", upload.single("anhdaidien"), addParent);
router.get("/get-all-drivers", getAllDrivers);
router.post("/add-driver", upload.single("anhdaidien"), addDriver);
router.get("/get-all-pickup-points", getAllPickupPoints);
router.post("/add-pickup-point", addPickupPoint);
router.get("/get-all-schedules", getAllSchadules);
router.post("/add-schedule", addSchedule);
router.get("/get-all-registered-pickup-points", getAllRegisteredPickupPoints);
router.get("/dashboard-info", getInfoDashboard);


export default router;