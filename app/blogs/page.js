import dynamic from "next/dynamic";
const LoadingUI = (
  <div className="flex justify-center items-center py-2">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
  </div>
);
const BlogClient = dynamic(() => import("./BlogClient"), {
  ssr: true,
  loading: () => LoadingUI,
});

import config from "../../components/utils/config";

export const metadata = {
  title: "Meetowner Blogs – Real Estate Tips, Guides & Insights",
  description:
    "Explore the latest articles on real estate, property investment, market trends, and home-buying tips from Meetowner – your trusted partner in property.",
  keywords: [
    "real estate blog",
    "property investment",
    "home buying tips",
    "real estate market trends",
    "Meetowner",
    "property guides",
    "real estate insights",
  ].join(", "),

  openGraph: {
    title: "Meetowner Blogs – Real Estate Tips, Guides & Insights",
    description:
      "Read expert articles on property investment, market updates, and home-buying advice from Meetowner.",
    url: `${
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.meetowner.com"
    }/blogs`,
    siteName: "Meetowner",
    images: [
      {
        url: "https://placehold.co/1200x630?text=Meetowner+Blog+OG+Image",
        width: 1200,
        height: 630,
        alt: "Meetowner Blog – Real Estate Articles",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Meetowner Blogs – Real Estate Tips, Guides & Insights",
    description:
      "Read expert articles on property investment, market updates, and home-buying advice from Meetowner.",
    images: ["https://placehold.co/1200x630?text=Meetowner+Blog+Twitter+Image"],
  },

  alternates: {
    canonical: `${
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.meetowner.com"
    }/blogs`,
  },

  robots: {
    index: true,
    follow: true,
  },
};

async function fetchBlogs() {
  try {
    const res = await fetch(`${config.awsApiUrl}/blogs/getAllBlogs`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return data || [];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const rawBlogs = await fetchBlogs();

  const parseHashtags = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map((t) => t.trim()) : [];
      } catch {
        return raw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  const blogs = rawBlogs.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.short_description || post.description?.slice(0, 150),
    content: post.description,
    author: {
      name: post.author_name || post.backup_name || "Unknown Author",
      avatar: post.author_photo
        ? `https://api.meetowner.in/aws/v1/s3/uploads${
            post.author_photo.startsWith("/") ? "" : "/"
          }${post.author_photo}`
        : "https://ui-avatars.com/api/?name=Unknown+Author",
    },
    publishedAt: post.created_at,
    readTime: "5 min read",
    category: post.category || "Uncategorized",
    tags: parseHashtags(post.hashtags) || [],
    image: post.image_url,
  }));
  return <BlogClient initialBlogs={blogs} />;
}
