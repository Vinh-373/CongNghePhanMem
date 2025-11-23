import express from "express";
import { getDriverById } from "../controllers/driverControllers.js";

const router = express.Router();

router.get("/:idtaixe", getDriverById);

export default router;