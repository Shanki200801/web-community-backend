# TIF Community Backend

You run a SaaS Platform that enables user to make their communities and add members to it.

Each user, can create a community and (automatically) gets assigned the `Community Admin` role. They can add other users to the community who get assigned the `Community Member` role.[https://tif-community-backend.onrender.com/](https://tif-community-backend.onrender.com/).

## Running the Application Locally

You can run the application locally using Docker. Here's how:

1. Install Docker on your machine if you haven't already. You can download it from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).

2. Clone this repository to your local machine:

```bash
git clone https://github.com/yourusername/tif-community-backend.git

cd tif-community-backend

docker run -p 5000:5000 tif-community-backend
```

### User Stories (Features)

- Module: Authentication
  - Feature: User should be able to signup using valid name, email and strong password.
  - Feature: User should be able to signin using valid credentials.
- Module: Community
  - Feature: User should be able to see all communities.
  - Feature: User should be able to create a community.
- Module: Moderation
  - Feature: User should be able to see all community members.
  - Feature: User should be able to add a user as member.
  - Feature: User should be able to remove a member from community.

### Problem Statement

- You need to build the APIs that adheres to above user stories.
- The Role names are strict.
- The API URLs and Response Structure is fixed.
- The field attributes and table names are strict as well.
- Addition of field for storing IDs when using NoSQL is allowed.
- Validations for each API must be carried out.

### Tech Stack

- Language: Node v14+
- Database: Postgres / MySQL / MongoDB
- ORM: Sequelize / Prisma / Mongoose / MongoDB Native Driver
- Library: [@theinternetfolks/snowflake](https://npmjs.com/package/@theinternetfolks/snowflake) to generate unique IDs instead of autoincrement, UUID or MongoDB ObjectID

You are **free to choose any database** and ORM that goes with it for your use.

Make sure to see all the examples including `Success` and `Error` example, by going to any "Example Request" and selecting from the dropdown on the right.

Please read the FAQ section at the end for more clarifications.

## Models

### Architecture

[](https://postimg.cc/WtBfpLCy)

<img src="https://i.postimg.cc/yYxqP7P7/Hiring-Assignment.png">

### User (`user`)

| Key          | Kind                 | Notes         |
| ------------ | -------------------- | ------------- |
| `id`         | `string` (snowflake) | primary key   |
| `name`       | `varchar(64)`        | default: null |
| `email`      | `varchar(128)`       | unique        |
| `password`   | `varchar(64)`        | \-            |
| `created_at` | `datetime`           | \-            |

### Community (`community`)

| Key          | Kind                 | Notes                                 |
| ------------ | -------------------- | ------------------------------------- |
| `id`         | `string` (snowflake) | primary key                           |
| `name`       | `varchar`(128)       | \-                                    |
| `slug`       | `varchar`(255)       | unique                                |
| `owner`      | `string` (snowflake) | ref: > `user.id`, relationship: `m2o` |
| `created_at` | `datetime`           | \-                                    |
| `updated_at` | `datetime`           | \-                                    |

### Role (`role`)

| Key          | Kind                 | Notes       |
| ------------ | -------------------- | ----------- |
| `id`         | `string` (snowflake) | primary key |
| `name`       | `varchar(64)`        | unique      |
| `created_at` | `datetime`           | \-          |
| `updated_at` | `datetime`           | \-          |

### Member (`member`)

| Key          | Kind                 | Notes                 |
| ------------ | -------------------- | --------------------- |
| `id`         | `string` (snowflake) | primary key           |
| `community`  | `string` (snowflake) | ref: > `community.id` |
| `user`       | `string` (snowflake) | ref: > `user.id`      |
| `role`       | `string` (snowflake) | ref: > `role.id`      |
| `created_at` | `datetime`           | \-                    |

Note:  
Snowflake IDs are just string. Think of them just like UUID. Use our [library](https://npmjs.com/package/@theinternetfolks/snowflake) to generate unique Snowflake IDs . It works exactly like generating UUIDs.

## API Endpoints

### Role

| Name    | URL             |
| ------- | --------------- |
| Create  | `POST /v1/role` |
| Get All | `GET /v1/role`  |

### User

| Name    | URL                    |
| ------- | ---------------------- |
| Sign Up | `POST /v1/auth/signup` |
| Sign in | `POST /v1/auth/signin` |
| Get Me  | `GET /v1/auth/me`      |

### Community

| Name                    | URL                             |
| ----------------------- | ------------------------------- |
| Create                  | `POST /v1/community`            |
| Get All                 | `GET /v1/community`             |
| Get All Members         | `GET /v1/community/:id/members` |
| Get My Owned Community  | `GET /v1/community/me/owner`    |
| Get My Joined Community | `GET /v1/community/me/member`   |

### Member

| Name          | URL                     |
| ------------- | ----------------------- |
| Add Member    | `POST /v1/member`       |
| Remove Member | `DELETE /v1/member/:id` |
