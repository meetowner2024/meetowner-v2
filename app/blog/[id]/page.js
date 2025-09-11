"use client";
import { useParams, useRouter } from "next/navigation";
import { blogPosts } from "../../../components/blog/blogData";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
export default function BlogPost() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const post = blogPosts.find((p) => p.id === id);
  console.log("post: ", post);
  if (!post) {
    router.push("/blog");
    return null;
  }
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "The article link has been copied to your clipboard.",
        });
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
    }
  };
  return (
    <div className="min-h-screen bg-blog-gradient-subtle">
      {}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
      {}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="animate-fade-in">
          {}
          <div className="aspect-video rounded-lg overflow-hidden mb-8 shadow-blog-card">
            {post.image && (
              <Image
                src={post.image}
                alt={post.title}
                width={800}
                height={400}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {}
          <header className="mb-8">
            <div className="flex items-center flex-wrap gap-3 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              <div className="flex items-center text-sm text-muted-foreground gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              {post.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{post.author.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Author</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </header>
          {}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              lineHeight: "1.8",
              fontSize: "1.125rem",
            }}
          />
          {}
          <div className="mt-12 pt-8 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Tags:</span>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
