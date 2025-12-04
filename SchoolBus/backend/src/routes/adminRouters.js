import express from "express";
import upload from "../middleware/upload.js";
import { 
    getAllStudents, addStudent,
    getAllVehicles, addVehicle, updateVehicle, deleteVehicle,
    getAllRoutes, addRoute,updateRoute,deleteRoute,
    getAllParents, addParent, updateParent,deleteParent,
    getAllDrivers, addDriver, updateDriver, deleteDriver,
    getAllPickupPoints, addPickupPoint, updatePickupPoint, deletePickupPoint,
    getAllSchadules, addSchedule, updateSchedule, softDeleteSchedule,
    getAllRegisteredPickupPoints,addRegisteredPickupPoint,updateRegisteredPickupPoint,softDeleteRegisteredPickupPoint,
    getAllNotification, addNotification, updateNotification, deleteNotification,
    getInfoDashboard,updateUser,changePassword,editStudent,deleteStudent
} from "../controllers/adminControllers.js";

const router = express.Router();

/* STUDENTS */
router.get("/get-all-students", getAllStudents);
router.post("/add-student", upload.single("anhdaidien"), addStudent);
router.delete("/delete-student/:idStudent", deleteStudent);
router.put("/edit-student/:idStudent", upload.single("anhdaidien"), editStudent);

/* VEHICLES */
router.post("/add-vehicle", addVehicle);
router.get("/get-all-vehicles", getAllVehicles);
router.put("/update-vehicle/:id", updateVehicle);      // <-- THÊM
router.delete("/delete-vehicle/:id", deleteVehicle);  // <-- THÊM

/* ROUTES */
router.get("/get-all-routes", getAllRoutes);
router.post("/add-route", addRoute);
router.put("/update-route/:idtuyenduong",updateRoute)
router.put("/delete-route/:idtuyenduong",deleteRoute)


/* PARENTS */
router.get("/get-all-parents", getAllParents);
router.post("/add-parent", upload.single("anhdaidien"), addParent);
router.put("/update-parent", upload.single("anhdaidien"), updateParent); 
router.delete("/delete-parent/:id", deleteParent);

/* DRIVERS */
router.get("/get-all-drivers", getAllDrivers);
router.post("/add-driver", upload.single("anhdaidien"), addDriver);
router.put('/update-driver', upload.single('anhdaidien'), updateDriver)
router.put("/delete-driver/:id", deleteDriver)

/* PICKUP POINTS */
router.get("/get-all-pickup-points", getAllPickupPoints);
router.post("/add-pickup-point", addPickupPoint);
router.put("/update-pickup-point/:id", updatePickupPoint);
router.put("/delete-pickup-point/:id", deletePickupPoint)

/* SCHEDULES */
router.get("/get-all-schedules", getAllSchadules);
router.post("/add-schedule", addSchedule);
router.put('/update-schedule/:id', updateSchedule);
router.put('/delete-schedule/:id', softDeleteSchedule);

/* REGISTERED PICKUP POINTS */
router.get("/get-all-registered-pickup-points", getAllRegisteredPickupPoints);
router.post("/add-registered-pickup-points", addRegisteredPickupPoint);
router.put("/update-registered-pickup-points/:id", updateRegisteredPickupPoint);
router.put("/delete-registered-pickup-points/:id", softDeleteRegisteredPickupPoint);

router.get('/get-all-notification', getAllNotification);
router.post('/add-notification', addNotification);
router.put('/update-notification/:idthongbao', updateNotification);
router.delete('/delete-notification/:idthongbao', deleteNotification);

/* DASHBOARD */
router.get("/dashboard-info", getInfoDashboard);
router.put("/update-user", upload.single('anhdaidien'),updateUser)
router.put("/change-password",changePassword)

export default router;
