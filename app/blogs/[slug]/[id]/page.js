import config from "../../../../components/utils/config";
import dynamic from "next/dynamic";
const LoadingUI = (
  <div className="flex justify-center items-center py-2">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
  </div>
);
const ClientBlogPost = dynamic(() => import("./client"), {
  ssr: true,
  loading: () => LoadingUI,
});
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
async function fetchSingleBlog(id) {
  try {
    const res = await fetch(`${config.awsApiUrl}/blogs/getBlogById/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch (err) {
    return null;
  }
}
export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.meetowner.com";
  const blog = await fetchSingleBlog(id);
  if (!blog)
    return {
      title: "Meetowner Blog",
      description: "Explore real estate content from Meetowner.",
    };
  const title = blog.title;
  const excerpt =
    blog.short_description ||
    (blog.description ? blog.description.slice(0, 150) : "");
  const canonical = `${baseUrl}/blogs/${slug}/${id}`;
  const tags = parseHashtags(blog.hashtags);
  const ogImage = `https://api.meetowner.in/aws/v1/s3/blogs/${blog.image_url}`;
  return {
    title: `${title} | Meetowner Blog`,
    description: excerpt,
    keywords: [...tags, blog.category, "Meetowner", "Real Estate Blog"].join(
      ", "
    ),
    openGraph: {
      title,
      description: excerpt,
      url: canonical,
      type: "article",
      siteName: "Meetowner",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: excerpt,
      images: [ogImage],
    },
    alternates: {
      canonical,
    },
  };
}
async function getPost(id) {
  const blog = await fetchSingleBlog(id);
  if (!blog) return null;
  return {
    id: blog.id,
    title: blog.title,
    excerpt:
      blog.short_description ||
      (blog.description ? blog.description.slice(0, 150) : ""),
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
    image: `https://api.meetowner.in/aws/v1/s3/blogs/${blog.image_url}`,
  };
}
export default async function BlogPostPage({ params }) {
  const { id } = params;
  const post = await getPost(id);
  if (!post)
    return (
      <div className="p-8 text-red-500 text-2xl flex justify-center h-screen items-center">
        Post not found.
      </div>
    );
  return <ClientBlogPost initialPost={post} />;
}
