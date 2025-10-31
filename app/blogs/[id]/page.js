import config from "../../../components/utils/config";
import ClientBlogPost from "./client";

const parseHashtags = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(t => t.trim()) : [];
    } catch {
      return raw.split(",").map(t => t.trim()).filter(Boolean);
    }
  }
  return [];
};
const resolveImageUrl = (imagePath) => {
  if (!imagePath) return "https://placehold.co/800x400?text=Blog+Post+Image";
  if (imagePath.startsWith("http")) return imagePath;
  return `https://api.meetowner.in/aws/v1/s3${
    imagePath.startsWith("/") ? "" : "/"
  }${imagePath}`;
};
export async function generateMetadata({ params }) {
  const id = params.id;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.meetowner.com";

  try {
    const res = await fetch(`${config.awsApiUrl}/blogs/getAllBlogs`, { cache: "no-store" });
    if (!res.ok) return { title: "Blog • Meetowner" };
    const { data } = await res.json();
    const blog = data?.find(p => p.id.toString() === id);
    if (!blog) return { title: "Blog • Meetowner" };

    const post = {
      title: blog.title,
      excerpt: blog.short_description || blog.description?.slice(0, 150),
      image: blog.image_url,
      tags: parseHashtags(blog.hashtags),
    };

    return {
      title: `${post.title} | Meetowner Blog`,
      description: post.excerpt,
      keywords: [...post.tags, "real estate blog", "Meetowner"].join(", "),
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: `${baseUrl}/blogs/${id}`,
        images: [{ url: post.image }],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: [post.image],
      },
      alternates: { canonical: `${baseUrl}/blogs/${id}` },
    };
  } catch {
    return { title: "Blog • Meetowner" };
  }
}

async function getPost(id) {
  try {
    const res = await fetch(`${config.awsApiUrl}/blogs/getAllBlogs`, { cache: "no-store" });
    if (!res.ok) return null;
    const { data } = await res.json();
    const blog = data?.find(p => p.id.toString() === id);
    if (!blog) return null;
    return {
      id: blog.id,
      title: blog.title,
      excerpt: blog.short_description || blog.description.slice(0, 150),
      content: blog.description,
      author: {
        name: blog.author_name || blog.backup_name || "Unknown Author",
        avatar: blog.author_photo
          ? `https://api.meetowner.in/aws/v1/s3/uploads/${blog.author_photo}`
          : "https://ui-avatars.com/api/?name=Unknown+Author",
      },
      publishedAt: blog.created_at,
      readTime: "5 min read",
      category: blog.category || "Uncategorized",
      tags: parseHashtags(blog.hashtags),
     image:blog.image_url,
    };
  } catch {
    return null;
  }
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params?.id);
  if (!post) return <div className="p-8 text-red-500">Post not found.</div>;
  return <ClientBlogPost initialPost={post} />;
}
