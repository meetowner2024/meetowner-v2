"use client";
import { useState } from "react";
import { blogPosts, categories } from "../../components/blog/blogData";
import BlogCard from "../../components/blog/BlogCard";
import { Button } from "../../components/ui/button";
import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import Head from "next/head";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Metadata for the blog page
  const pageTitle = "Meetowner Blog - Real Estate, Interior Design, and More";
  const pageDescription =
    "Explore the latest insights on real estate, interior design, digital marketing, and sustainable buildings in India. Find tips, trends, and guides on the Meetowner Blog.";
  const keywords =
    "real estate blog, interior design tips, property buying guide, sustainable buildings, digital marketing real estate, Meetowner blog";
  const canonicalUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
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
                url: "https://yourdomain.com/logo.png", // Replace with your logo URL
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
          <div className="flex justify-center">
            <p className="text-4xl font-bold text-gray-400">Meetowner</p>
          </div>
        </section>
        <section className="px-4 py-8">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="transition-all duration-200"
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
                <p className="text-muted-foreground">
                  Try adjusting your search terms or selected category.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
