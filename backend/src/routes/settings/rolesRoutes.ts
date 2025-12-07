import { Router } from "express";
import { createRolesPermission, deleteRolePrmission, getRolesPermission, updateRolesPermission } from "../../controllers/settings/rolesController";

const router = Router();

router.post("/create-roles", createRolesPermission);
router.get("/get-roles", getRolesPermission);
router.put("/update-role/:id", updateRolesPermission);
router.delete("/delete-role/:id", deleteRolePrmission);

export default router;