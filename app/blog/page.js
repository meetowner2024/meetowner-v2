"use client";
import { useState } from "react";
import { blogPosts, categories } from "../../components/blog/blogData";
import BlogCard from "../../components/blog/BlogCard";
import { Button } from "../../components/ui/button";
import { Search, PenTool } from "lucide-react";
import { Input } from "../../components/ui/input";
import blogHeroImage from "../assets/FAMILY MEETOWNER (1).jpg";

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
  return (
    <div className="min-h-screen bg-blog-gradient-subtle">
      <section className="relative py-12 px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-blog-hero bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${blogHeroImage.src})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-glow/20" />
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-primary-glow mb-6">
              <PenTool className="w-4 h-4" />
              <span className="text-sm font-medium">Latest Insights</span>
            </div>
            <h1 className="text-hero font-bold text-foreground mb-6 leading-tight">
              Our <span className="text-primary">Blog</span>
            </h1>
            <p className="text-blog-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover insights, tutorials, and best practices from our team of
              experts. Stay updated with the latest trends in web development
              and design.
            </p>
          </div>
        </div>
      </section>
      {}
      <section className="px-4 py-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
            {}
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
            {}
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
          {}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          {}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or selected category.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
