import { defineCollection, z } from "astro:content";

// Define available categories
const categories = [
  "Web Design",
  "AI Tools",
  "SEO",
  "Web Development",
  "Digital Marketing",
  "Tutorials"
] as const;

// Project categories
const projectCategories = [
  "Healthcare",
  "E-commerce",
  "Education",
  "Real Estate",
  "Technology",
  "Finance"
] as const;

// Blog Posts Collection
const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.string(),
    excerpt: z.string(),
    category: z.enum(categories),
    image: z.string(),
  }),
});

// Projects Collection
const projectsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(projectCategories),
    client: z.string(),
    image: z.string(),
    results: z.array(z.string()),
    tags: z.array(z.string()).optional(),
    gallery: z.array(
      z.object({
        url: z.string(),
        alt: z.string().optional(),
        caption: z.string().optional(),
      })
    ).optional(),
  }),
});

// Testimonials Collection
const testimonialCollection = defineCollection({
  type: "content",
  schema: z.object({
    author: z.object({
      en: z.string(),
      ar: z.string()
    }),
    role: z.object({
      en: z.string(),
      ar: z.string()
    }),
    company: z.object({
      en: z.string(),
      ar: z.string()
    }),
    testimonial: z.object({
      en: z.string(),
      ar: z.string()
    }),
    avatar: z.string(),
  }),
});

export const collections = {
  posts: blogCollection,
  projects: projectsCollection,
  testimonials: testimonialCollection,
};
