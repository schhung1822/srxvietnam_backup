import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

function readEnv(...names) {
  for (const name of names) {
    const value = process.env[name];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

const projectId = readEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'VITE_SANITY_PROJECT_ID');
const dataset = readEnv('NEXT_PUBLIC_SANITY_DATASET', 'VITE_SANITY_DATASET') || 'production';
const apiVersion = readEnv('NEXT_PUBLIC_SANITY_API_VERSION', 'VITE_SANITY_API_VERSION') || '2024-01-01';
const token = readEnv('SANITY_TOKEN', 'VITE_SANITY_TOKEN');

if (!projectId) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID in environment variables');
  console.error('Please add your Sanity project ID to .env or your deployment environment settings');
}

export const client = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion,
  ...(token && { token }),
});

const builder = imageUrlBuilder(client);

export const urlFor = (source) => {
  if (!source) {
    return null;
  }

  return builder.image(source);
};

export const queries = {
  allPosts: `*[_type == "post" && status == "published"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    author->{
      name,
      slug,
      image
    },
    categories[]->{
      title,
      slug,
      color,
      icon
    },
    tags,
    publishedAt,
    featured,
    readingTime,
    seo
  }`,

  featuredPosts: `*[_type == "post" && status == "published" && featured == true] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    author->{
      name,
      slug,
      image
    },
    categories[]->{
      title,
      slug,
      color,
      icon
    },
    publishedAt,
    readingTime
  }`,

  postBySlug: `*[_type == "post" && slug.current == $slug && status == "published"][0] {
    _id,
    title,
    slug,
    excerpt,
    body,
    mainImage,
    author->{
      name,
      slug,
      image,
      bio,
      socialMedia
    },
    categories[]->{
      title,
      slug,
      color,
      icon
    },
    tags,
    publishedAt,
    readingTime,
    seo,
    relatedPosts[]->{
      _id,
      title,
      slug,
      excerpt,
      mainImage,
      publishedAt,
      readingTime
    }
  }`,

  allCategories: `*[_type == "category" && isActive == true] | order(order asc) {
    _id,
    title,
    slug,
    description,
    color,
    icon,
    order
  }`,

  postsByCategory: `*[_type == "post" && status == "published" && references($categoryId)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    author->{
      name,
      slug,
      image
    },
    categories[]->{
      title,
      slug,
      color,
      icon
    },
    publishedAt,
    readingTime
  }`,

  allAuthors: `*[_type == "author"] {
    _id,
    name,
    slug,
    image,
    bio,
    email,
    socialMedia
  }`,

  searchPosts: `*[_type == "post" && status == "published" && (
    title match $searchTerm + "*" ||
    excerpt match $searchTerm + "*" ||
    tags[] match $searchTerm + "*"
  )] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    author->{
      name,
      slug,
      image
    },
    categories[]->{
      title,
      slug,
      color,
      icon
    },
    publishedAt,
    readingTime
  }`,
};

export const fetchSanityData = async (query, params = {}) => {
  try {
    if (!projectId) {
      throw new Error('Sanity project ID is missing. Please check your environment variables.');
    }

    const data = await client.fetch(query, params);
    return data;
  } catch (error) {
    console.error('Sanity fetch error:', error);

    if (error.message.includes('project not found')) {
      console.error('Project ID not found. Check NEXT_PUBLIC_SANITY_PROJECT_ID.');
    } else if (error.message.includes('dataset not found')) {
      console.error('Dataset not found. Check NEXT_PUBLIC_SANITY_DATASET.');
    }

    throw error;
  }
};

export const testConnection = async () => {
  try {
    console.log('Testing Sanity connection...');
    console.log('Project ID:', projectId);
    console.log('Dataset:', dataset);

    const result = await client.fetch('*[_type == "post"][0...1]');
    console.log('Sanity connection successful!');
    console.log('Sample data:', result);
    return true;
  } catch (error) {
    console.error('Sanity connection failed:', error);
    return false;
  }
};
