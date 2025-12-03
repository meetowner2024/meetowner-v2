"use client";

import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Calendar, User, Share2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import Breadcrumb from "../../../../components/utils/BreadCrumb";
import dynamic from "next/dynamic";
const LoadingUI = (
  <div className="flex justify-center items-center py-2">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
  </div>
);
const Header = dynamic(() => import("../../../../components/Header"), {
  ssr: false,
  loading: () => LoadingUI,
});
export default function ClientBlogPost({ initialPost, slug }) {
  const post = initialPost;
  const handleShare = async () => {
    const url = `${window.location.origin}/blogs/${slug}/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url });
      } catch {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  return (
    <div className="min-h-screen bg-blog-gradient-subtle">
      <div className="bg-background ">
        <Header />
      </div>

      <article className="container mx-auto px-4 py-12 sm:max-w-6xl">
        <div className="mb-2">
          <Breadcrumb title={post.title} />
        </div>
        <div className="animate-fade-in">
          {post.image && (
            <div className="aspect-video rounded-lg overflow-hidden mb-8 shadow-blog-card">
              <Image
                src={post.image}
                alt={post.title}
                width={800}
                height={400}
                className="w-full h-full object-cover"
                priority
                crossOrigin="anonymous"
              />
            </div>
          )}

          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              {post.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">{post.excerpt}</p>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  {post.author.avatar ? (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-black">
                      {post.author.name
                        ? post.author.name[0].toUpperCase()
                        : "?"}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium capitalize">
                        {post.author.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Author
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </header>

          <div
            className="prose prose-lg max-w-none "
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{ lineHeight: "1.8", fontSize: "1.125rem" }}
          />

          <div className="mt-8 pt-6 border-t">
            <div className="flex flex-wrap items-center gap-1 w-full ">
              <span className="text-sm text-muted-foreground font-semibold">Tags:</span>
              <div className="flex flex-wrap gap- 2">
                {post.tags && post.tags.length > 0 ? (
                  post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block text-sm  font-medium bg-muted text-foreground px-3 py-1.5 rounded-full hover:bg-muted/80 transition"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
