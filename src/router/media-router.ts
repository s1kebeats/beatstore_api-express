import { Router } from "express";
const router = Router();
import { body } from "express-validator";
import authMiddleware from "../middlewares/auth-middleware";
import mediaController from "../controllers/media-controller";
import validationMiddleware from "../middlewares/validation-middleware";

// getting media
router.get("/:path/:key", mediaController.getMedia);
// uploading media to aws s3
router.post("/upload", authMiddleware, body("path").notEmpty().bail(), validationMiddleware, mediaController.upload);

export default router;