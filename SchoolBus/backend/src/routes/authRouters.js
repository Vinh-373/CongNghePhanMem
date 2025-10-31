import express from "express";
import upload from "../middleware/upload.js";
import { login, register } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", upload.single('anhdaidien'), register);

export default router;
