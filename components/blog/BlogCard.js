import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BlogCard({ post }) {
  const authorInitial = post.author.name
    ? post.author.name.charAt(0).toUpperCase()
    : "?";
  return (
    <Link href={`/blog/${post.id}`} className="block group ">
      <Card className="h-full shadow-2xl hover:shadow-blog-card-hover border-2 border-gray-300 transition-all duration-300 group-hover:-translate-y-1 overflow-hidden">
        <div className="aspect-video overflow-hidden">
          <Image
            priority
            src={post.image}
            alt={`${post.title} - Meetowner Blog`}
            width={800}
            height={400}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {post.category}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
          <h3 className="text-blog-lg font-bold leading-tight group-hover:text-primary transition-colors duration-200">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-black flex items-center justify-center text-sm font-medium">
                {authorInitial}
              </div>
              <span className="text-sm text-muted-foreground">
                {post.author.name}
              </span>
            </div>
            {/* <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </div> */}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}