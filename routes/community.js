const express = require("express");
const router = express.Router();
const Member = require("../models/Member"); // Adjust the path as per your project structure
const Community = require("../models/Community"); // Adjust the path as per your project structure
const User = require("../models/User"); // Adjust the path as per your project structure
const Role = require("../models/Role"); // Adjust the path as per your project structure

router.post("/community", async (req, res) => {
  const { name } = req.body;
  const slug = name.toLowerCase().replace(/ /g, "-");
  if (name.length < 2) {
    error_obj.errors.push({
      param: "name",
      message: "Name should be at least 2 characters.",
      code: "INVALID_INPUT",
    });
    return res.status(400).json(error_obj);
  }
  // Check if the community already exists
  if (await Community.findOne({ slug })) {
    const error_obj = {
      status: false,
      errors: [
        {
          param: "name",
          message: "Community with this name already exists.",
          code: "RESOURCE_EXISTS",
        },
      ],
    };
    return res.status(400).json(error_obj);
  }
  const owner = req.cookies.user; // Assuming the user ID is stored in a cookie named "userId"
  //add record to community
  const newCommunity = new Community({ name, slug, owner });
  await newCommunity.save();
  //add record to member
  const newMember = new Member({
    community: newCommunity.id,
    user: owner,
    role: "Community Admin",
  });
  await newMember.save();
  res.status(200).json({
    status: true,
    content: {
      data: {
        id: newCommunity.id,
        name: newCommunity.name,
        slug: newCommunity.slug,
        owner: newCommunity.owner,
        created_at: newCommunity.createdAt,
        updated_at: newCommunity.updatedAt,
      },
    },
  });
});
router.get("/community", async (req, res) => {
  try {
    const communities = await Community.find().exec();

    // Use Promise.all to find the user for each community in parallel
    const communitiesWithOwners = await Promise.all(
      communities.map(async (community) => {
        // Find the user with the id that matches the owner field
        const owner = await User.findOne({ id: community.owner }).exec();

        return {
          ...community._doc, // This will include all the properties of the community
          owner: {
            id: owner.id,
            name: owner.name,
          },
        };
      })
    );

    const response = {
      status: true,
      content: {
        meta: {
          total: communitiesWithOwners.length,
          pages: 1,
          page: 1,
        },
        data: communitiesWithOwners.map((community) => ({
          id: community.id,
          name: community.name,
          slug: community.slug,
          owner: community.owner,
          created_at: community.createdAt.toISOString(),
          updated_at: community.updatedAt.toISOString(),
        })),
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/community/:id/members", async (req, res) => {
  const communityId = req.params.id;
  const community = await Community.findOne({ id: communityId });
  if (!community) {
    return res.status(404).json({
      status: false,
      errors: [
        {
          message: "Community not found.",
          code: "RESOURCE_NOT_FOUND",
        },
      ],
    });
  }
  const members = await Member.find({ community: communityId })
    .populate("user", "id name")
    .populate("role", "id name") // This line includes the role's id and name in the member data
    .exec();
  console.log(members, "members are returned");

  res.status(200).json({
    status: true,
    content: {
      meta: {
        total: members.length,
        pages: 1,
        page: 1,
      },
      data: members.map((member) => ({
        id: member.id,
        community: member.community,
        user: {
          id: member.user.id,
          name: member.user.name,
        },
        role: {
          id: member.role.id,
          name: member.role.name,
        },
        created_at: member.createdAt.toISOString(),
      })),
    },
  });
});

router.get("/community/me/owner", async (req, res) => {
  try {
    const userId = req.cookies.user; // Get the user's id from the cookies
    const communities = await Community.find({ owner: userId }).exec();

    const response = {
      status: true,
      content: {
        meta: {
          total: communities.length,
          pages: 1,
          page: 1,
        },
        data: communities.map((community) => ({
          id: community.id,
          name: community.name,
          slug: community.slug,
          owner: community.owner,
          created_at: community.createdAt.toISOString(),
          updated_at: community.updatedAt.toISOString(),
        })),
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/community/me/member", async (req, res) => {
  try {
    const userId = req.cookies.user; // Get the user's id from the request
    const page = req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const memberCommunities = await Member.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .populate("community", "id name slug owner")
      .populate({
        path: "community",
        populate: {
          path: "owner",
          select: "id name",
        },
      })
      .exec();

    const total = await Member.countDocuments({ user: userId });

    const response = {
      status: true,
      content: {
        meta: {
          total: total,
          pages: Math.ceil(total / limit),
          page: page,
        },
        data: memberCommunities.map((member) => ({
          id: member.community.id,
          name: member.community.name,
          slug: member.community.slug,
          owner: {
            id: member.community.owner.id,
            name: member.community.owner.name,
          },
          created_at: member.community.createdAt.toISOString(),
          updated_at: member.community.updatedAt.toISOString(),
        })),
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
