// role.js
const express = require("express");
const router = express.Router();
const Role = require("../models/Role"); // Adjust the path as per your project structure

// used to create a user role
router.post("/role", async (req, res) => {
  const error_obj = {
    status: false,
    errors: [],
  };
  try {
    const { name } = req.body;
    if (name.length < 2) {
      error_obj.errors.push({
        param: "name",
        message: "Name should be at least 2 characters.",
        code: "INVALID_INPUT",
      });
      return res.status(400).json(error_obj);
    }
    // Check if the role already exists
    if (await Role.findOne({ name })) {
      error_obj.errors.push({
        param: "name",
        message: "Role with this name already exists.",
        code: "RESOURCE_EXISTS",
      });
      return res.status(400).json(error_obj);
    }
    const newRole = new Role({ name });
    await newRole.save();
    res.status(201).json({
      status: true,
      content: {
        data: {
          id: newRole.id,
          name: newRole.name,
          created_at: newRole.createdAt,
          updated_at: newRole.updatedAt,
        },
      },
    });
  } catch (error) {
    // Handle the error here
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/role", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 10; // 10 documents per page
    const skip = (page - 1) * limit;

    const total = await Role.countDocuments();
    const pages = Math.ceil(total / limit);
    const roles = await Role.find().skip(skip).limit(limit);

    res.json({
      status: true,
      content: {
        meta: {
          total,
          pages,
          page,
        },
        data: roles,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
