"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import Head from "next/head";
import config from "../../../components/utils/config";

export default function BlogPost() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
    const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
         const res = await fetch(`${config.awsApiUrl}/blogs/getAllBlogs`, {
        cache: "no-store",
      });
        if (!res.ok) {
          throw new Error("Failed to fetch blog post");
        }
        const data = await res.json();
        const blog = data?.data?.find((p) => p.id.toString() === id);

        if (!blog) {
          router.push("/blog"); 
          return;
        }

       
        const transformedPost = {
          id: blog.id,
          title: blog.title,
          excerpt: blog.short_description || blog.description.slice(0, 150),
          content: blog.description,
          author: {
            name: blog.author || "Unknown Author",
            avatar:
              blog.image_url ||
              "https://ui-avatars.com/api/?name=Unknown+Author",
          },
          publishedAt: blog.created_at,
          readTime: "5 min read",
          category: blog.category || "Uncategorized",
          tags: blog.hashtags || [],
          image:
            blog.image_url ||
            "https://placehold.co/800x400?text=Blog+Post+Image",
        };

        setPost(transformedPost);
        setLoading(true);
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError(err.message);
        router.push("/blog"); 
      }finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, router]);


  const handleShare = async () => {
    if (!post) return;

    const shareUrl = `${window.location.origin}/blog/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
           url: window.location.href,
        });
      } catch (error) {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "The article link has been copied to your clipboard.",
        });
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
    }
  };

  // Metadata
  const pageTitle = post ? `${post.title} | Meetowner Blog` : "Meetowner Blog";
  const pageDescription = post
    ? post.excerpt
    : "Explore the latest insights on real estate, interior design, digital marketing, and sustainable buildings.";
  const keywords = post
    ? `${post.tags.join(", ")}, real estate blog, Meetowner`
    : "real estate blog, Meetowner";
  const canonicalUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/blog/${id}`;
  const ogImage =
    post?.image || "https://placehold.co/800x400?text=Blog+Post+Image";

 if (loading) {
    return (
      <div className="min-h-screen bg-blog-gradient-subtle">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-background border-b">
            <div className="px-4 py-6">
              <div className="w-24 h-8 bg-gray-300 animate-pulse rounded"></div>
            </div>
          </div>
          <article className="animate-fade-in">
            <div className="aspect-video rounded-lg overflow-hidden mb-8 shadow-blog-card bg-gray-300 animate-pulse"></div>
            <header className="mb-8">
              <div className="flex items-center flex-wrap gap-3 mb-4">
                <div className="w-20 h-6 bg-gray-300 animate-pulse rounded"></div>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <div className="w-24 h-6 bg-gray-300 animate-pulse rounded"></div>
                  <div className="w-20 h-6 bg-gray-300 animate-pulse rounded"></div>
                </div>
              </div>
              <div className="w-3/4 h-10 bg-gray-300 animate-pulse rounded mb-6"></div>
              <div className="w-2/3 h-6 bg-gray-300 animate-pulse rounded mb-8"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 animate-pulse"></div>
                  <div>
                    <div className="w-24 h-6 bg-gray-300 animate-pulse rounded"></div>
                    <div className="w-16 h-4 bg-gray-300 animate-pulse rounded mt-1"></div>
                  </div>
                </div>
                <div className="w-20 h-8 bg-gray-300 animate-pulse rounded"></div>
              </div>
            </header>
            <div className="prose prose-lg max-w-none">
              <div className="w-full h-96 bg-gray-300 animate-pulse rounded"></div>
            </div>
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-12 h-4 bg-gray-300 animate-pulse rounded"></div>
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="w-16 h-6 bg-gray-300 animate-pulse rounded ml-2"
                  ></div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }
  if (error || !post) {
    return null; 
  }

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
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="400" />
        <meta property="og:image:alt" content={post.title} />
        <meta property="og:site_name" content="Meetowner" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={post.title} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: ogImage,
            url: canonicalUrl,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            author: {
              "@type": "Person",
              name: post.author.name,
            },
            publisher: {
              "@type": "Organization",
              name: "Meetowner",
              logo: {
                "@type": "ImageObject",
                url: "/assets/images/Untitled-22.png", 
              },
            },
            keywords: post.tags.join(", "),
            articleSection: post.category,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": canonicalUrl,
            },
          })}
        </script>
      </Head>
      <div className="min-h-screen bg-blog-gradient-subtle">
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
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="animate-fade-in">
            <div className="aspect-video rounded-lg overflow-hidden mb-8 shadow-blog-card">
              {post.image && (
                <Image
                  src={post.image}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                  priority
                />
              )}
            </div>
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
                  {/* <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </div> */}
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
                    <div className="w-6 h-6 rounded-full bg-gray-200  p-4 text-black flex items-center justify-center text-sm font-medium">
              {post?.author?.name?.charAt(0).toUpperCase()}
              </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{post.author.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Author
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </header>
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{
                lineHeight: "1.8",
                fontSize: "1.125rem",
              }}
            />
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
    </>
  );
}