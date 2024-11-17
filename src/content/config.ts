import { defineCollection, z } from "astro:content";

// Blog Posts Collection
const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.string(),
    excerpt: z.string(),
    tags: z.array(z.string()),
    image: z.string(),
  }),
});

// Projects Collection
const projectsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    image: z.string(),
    client: z.string(),
    tags: z.array(z.string()),
    results: z.array(z.string()),
  }),
});

export const collections = {
  posts: blogCollection, // Existing blog collection
  projects: projectsCollection, // New projects collection
};
