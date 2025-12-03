"use client";

import { useState } from "react";
import BlogCard from "../../components/blog/BlogCard";
import { Button } from "../../components/ui/button";
import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import Breadcrumb from "../../components/utils/BreadCrumb";
import dynamic from "next/dynamic";
const LoadingUI = (
  <div className="flex justify-center items-center py-2">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
  </div>
);
const Header = dynamic(() => import("../../components/Header"), {
  ssr: true,
  loading: () => LoadingUI,
});

export default function BlogClient({ initialBlogs }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs] = useState(initialBlogs);
  const [loading] = useState(false);
  const [error] = useState(null);

  const uniqueCategories = ["All" , ...new Set(blogs.map((p) => p.category))];

  const filteredPosts = blogs.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-blog-gradient-subtle ">
      <section className="relative   overflow-hidden">
        <div className="flex flex-col gap-1">
          <Header />
        </div>
      </section>

      <section className=" py-2">
        <div className="container mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-lg font-medium">
                  Loading Blogs...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-6  items-center justify-between mb-8">
                <div className="flex flex-wrap gap-2">
                  {uniqueCategories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`${
                        selectedCategory === category
                          ? "bg-blue-900 text-white"
                          : ""
                      } transition-all duration-200`}
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
                      ×
                    </button>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <Breadcrumb />
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
                      No articles found for "{searchQuery}".
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
