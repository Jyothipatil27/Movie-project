import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const favoriteSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["Movie","TV Show"]),
  director: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  yearTime: z.string().optional().nullable(),
  posterUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable()
});

app.post("/api/favorites", async (req, res) => {
  try {
    const data = favoriteSchema.parse(req.body);
    const created = await prisma.favorite.create({ data });
    res.status(201).json(created);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/favorites", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const cursorId = req.query.cursor ? Number(req.query.cursor) : undefined;
  try {
    const items = await prisma.favorite.findMany({
      take: limit + 1,
      ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
      orderBy: { id: "desc" }
    });
    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, -1) : items;
    const nextCursor = results.length ? results[results.length - 1].id : null;
    res.json({ data: results, nextCursor, hasMore });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/favorites/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const data = favoriteSchema.partial().parse(req.body);
    const updated = await prisma.favorite.update({
      where: { id },
      data
    });
    res.json(updated);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/favorites/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.favorite.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT ?? 4000;
app.listen(port, () => console.log(`Server running on ${port}`));
