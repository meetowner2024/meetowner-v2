"use client";
import { useEffect, useState } from "react";
import BlogCard from "../../components/blog/BlogCard";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import Head from "next/head";
import { useRouter } from "next/navigation";
import config from "../../components/utils/config";
export default function Blog() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchData = async () => {
    try {
      setLoading(true);
       const res = await fetch(`${config.awsApiUrl}/blogs/getAllBlogs`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch blogs");
      }
      const data = await res.json();

      const transformedBlogs = data?.data?.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.short_description || post.description.slice(0, 150),
        content: post.description,
        author: {
          name: post.author || "Unknown Author",
          avatar: post.image_url || "https://ui-avatars.com/api/?name=Unknown+Author",
        },
        publishedAt: post.created_at,
        readTime: "5 min read",
        category: post.category || "Uncategorized",
        tags: post.hashtags || [],
        image: post.image_url || "https://placehold.co/800x400?text=Blog+Post+Image",
      }));

      setBlogs(transformedBlogs || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const uniqueCategories = ["All", ...new Set(blogs.map((post) => post.category))];



  const filteredPosts = blogs.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  // Metadata for the blog page
  const pageTitle = "Meetowner Blog - Real Estate, Interior Design, and More";
  const pageDescription =
    "Explore the latest insights on real estate, interior design, digital marketing, and sustainable buildings in India. Find tips, trends, and guides on the Meetowner Blog.";
  const keywords =
    "real estate blog, interior design tips, property buying guide, sustainable buildings, digital marketing real estate, Meetowner blog";
  const canonicalUrl = `${typeof window !== "undefined" ? window.location.origin : ""
    }/blog`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta
          property="og:image"
          content="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop"
        />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="400" />
        <meta property="og:image:alt" content="Meetowner Blog" />
        <meta property="og:site_name" content="Meetowner" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta
          name="twitter:image"
          content="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop"
        />
        <meta name="twitter:image:alt" content="Meetowner Blog" />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Meetowner Blog",
            description: pageDescription,
            url: canonicalUrl,
            publisher: {
              "@type": "Organization",
              name: "Meetowner",
              logo: {
                "@type": "ImageObject",
                url: "https://yourdomain.com/logo.png",
              },
            },
            blogPost: filteredPosts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              image: post.image,
              url: `${canonicalUrl}/${post.id}`,
              datePublished: post.publishedAt,
              author: {
                "@type": "Person",
                name: post.author.name,
              },
              keywords: post.tags.join(", "),
            })),
          })}
        </script>
      </Head>
      <div className="min-h-screen bg-blog-gradient-subtle">

        <section className="relative py-12 px-4 overflow-hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 sm:font-bold p-1 sm:py-2 sm:px-4 rounded"
            >
              <ArrowLeft />
            </button>
          </div>
          <div className="flex justify-center">
            <p className="text-4xl font-bold text-gray-400">Meetowner</p>
          </div>
        </section>
        <section className="px-4 py-8">
          <div className="container mx-auto">
            {loading ? (
              <div className="text-center py-16">
                <div
                  className="flex items-center justify-center h-[60vh] animate-slide-up"
                  aria-busy="true"
                  aria-label="Loading blog posts"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-lg font-medium">
                      Loading Blogs...
                    </p>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-500">
                <p>Error: {error}</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
                  <div className="flex flex-wrap gap-2">
                    {uniqueCategories.map((category) => (
                      <Button
                        key={category}
                        variant={
                          selectedCategory === category ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={` ${selectedCategory === category ? "bg-blue-900 text-white" : ""} transition-all duration-200`}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        className="absolute right-2 text-3xl -top-[2px] text-gray-400 hover:text-gray-600"
                        onClick={() => setSearchQuery("")}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
                  {filteredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
                {filteredPosts.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No articles found
                    </h3>
                    {searchQuery && (
                      <p className="text-muted-foreground">
                        No articles found for &quot;{searchQuery}&quot;.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}