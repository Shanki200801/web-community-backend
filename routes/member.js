const express = require("express");
const router = express.Router();
const Member = require("../models/Member"); // Adjust the path as per your project structure
const Community = require("../models/Community"); // Adjust the path as per your project structure
const User = require("../models/User"); // Adjust the path as per your project structure
const Role = require("../models/Role"); // Adjust the path as per your project structure

router.post("/member", async (req, res) => {
  const { community, user, role } = req.body;
  const userId = req.cookies.user; // Assuming the user ID is stored in a cookie named "userId"
  console.log("trying to add", user, "to", community, "as", role, "by", userId);
  // Check if the current user has the role Community Admin on the community

  const community_admin = await Community.findOne({
    id: community,
    owner: userId,
  });

  try {
    //if not dont allow to create member
    if (!community_admin) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "You are not authorized to perform this action.",
            code: "NOT_ALLOWED_ACCESS",
          },
        ],
      });
    }
    //check if user exists
    const is_user = await User.findOne({ id: user });
    if (!is_user) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "user",
            message: "User not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }
    //check if user is already a member
    const isMember = await Member.findOne({ user, community });
    if (isMember) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "User is already added in the community.",
            code: "RESOURCE_EXISTS",
          },
        ],
      });
    }
    //check if role is valid

    const isRole = await Role.findOne({ id: role });
    if (!isRole) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "role",
            message: "Role not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }

    //check if community is valid
    const communityExists = await Community.findOne({ id: community });
    if (!communityExists) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "community",
            message: "Community not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }

    const newMember = new Member({ community, user, role });
    await newMember.save();
    res.status(201).json({
      status: true,
      content: {
        data: {
          id: newMember.id,
          community: newMember.community,
          user: newMember.user,
          role: newMember.role,
          created_at: newMember.createdAt,
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/member/:id", async (req, res) => {
  try {
    const memberId = req.params.id;
    const userId = req.cookies.user; // Assuming you have user id in req.user.id

    // Find all members with the given id
    const members = await Member.find({ id: memberId });

    if (members.length === 0) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Loop through the members
    for (let member of members) {
      // Find the community
      const community = await Community.findOne({ id: member.community });

      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }

      // Check if the user is the owner of the community
      if (community.owner !== userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this member" });
      }

      // Delete the member
      await Member.findOneAndDelete({ id: member.id });
    }

    res.json({ message: "Member(s) deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
