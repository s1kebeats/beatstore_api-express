import request from "supertest";
import prisma from "../client";
import bcrypt from "bcrypt";
import app from "./app.js";
import PrismaClient from "@prisma/client";

const mock: PrismaClient.Prisma.UserCreateInput = {
  username: "s1kebeats",
  displayedName: "Arthur Datsenko-Boos",
  image: "path/to/image",
  password: await (() => bcrypt.hash("Password1234", 3))(),
  email: "s1kebeats@gmail.com",
  activationLink: "s1kebeats-activation-link",
  isActivated: true,
};
beforeAll(async () => {
  await prisma.user.createMany({
    data: [mock],
  });
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

it("POST request should return 404", async () => {
  const res = await request(app).post("/api/author/s1kebeats");
  await expect(res.statusCode).toBe(404);
});
it("providing wrong username, should return 404", async () => {
  const res = await request(app).get("/api/author/NotExistingAuthor");
  await expect(res.statusCode).toBe(404);
});
it("providing right username, should return 200", async () => {
  const res = await request(app).get("/api/author/s1kebeats");
  await expect(res.statusCode).toBe(200);
});