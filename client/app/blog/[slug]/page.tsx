"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, User, Tag, ArrowLeft, Share2, Facebook, Twitter, Linkedin, ExternalLink } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featuredImage?: string
  category?: string
  tags: string[]
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  author: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const slug = params.slug as string
        const response = await fetch(`/api/blog/posts?slug=${slug}`)
        
        if (!response.ok) {
          throw new Error('Blog post not found')
        }
        
        const data = await response.json()
        
        if (data.posts && data.posts.length > 0) {
          const blogPost = data.posts[0]
          setPost(blogPost)
        } else {
          setError('Blog post not found')
        }
      } catch (err) {
        console.error('Error fetching blog post:', err)
        setError('Blog post not found')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPost()
  }, [params.slug])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = post?.title || ''

  const shareLinks = [
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: Facebook
    },
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      icon: Twitter
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      icon: Linkedin
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="animate-pulse">
              <ExternalLink className="h-16 w-16 text-red-500 mx-auto mb-4" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Redirecting to External Article</h1>
            <p className="text-gray-600 mb-6">
              You are being redirected to the full article. Please wait...
            </p>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <p className="text-sm text-gray-500">
                If you are not redirected automatically, 
                <a 
                  href={post?.redirectUrl} 
                  className="text-red-600 hover:text-red-700 ml-1 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  click here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Featured Image as Hero */}
      {post.featuredImage && (
        <div className="relative w-full h-[300px] md:h-[450px] lg:h-[550px] overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <article className="max-w-4xl mx-auto">
          {/* Back to Blog Posts Button (Top Left) */}
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="outline" className="">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog Posts
              </Button>
            </Link>
          </div>

          {/* Blog Post Header (Title, Category, Meta) */}
          <header className="mb-8">
            {post.category && (
              <span className="inline-block bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-medium mb-4">
                {post.category}
              </span>
            )}

            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight font-tiempos text-gray-900">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 space-x-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{post.author.firstName} {post.author.lastName}</span>
              </div>
            </div>

            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-8 font-suisse leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div 
              className="text-gray-700 leading-relaxed font-['Suisse_Intl',sans-serif]"
              dangerouslySetInnerHTML={{ __html: post.content }}
            >
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 border-t pt-8">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Bio */}
          <div className="border-t pt-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {post.author.firstName} {post.author.lastName}
                </h3>
                <p className="text-gray-600 text-sm">
                  Real Estate Professional at The BLX Realty
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
} 