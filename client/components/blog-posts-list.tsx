"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, Calendar, User } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  category?: string
  tags: string[]
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  author?: {
    firstName?: string
    lastName?: string
  }
}

export default function BlogPostsList() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/blogs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      } else {
        toast.error('Failed to fetch blog posts')
      }
    } catch (error) {
      toast.error('Failed to fetch blog posts')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAuthorName = (author?: { firstName?: string; lastName?: string }) => {
    if (!author) return 'Anonymous'
    const firstName = author.firstName || ''
    const lastName = author.lastName || ''
    return `${firstName} ${lastName}`.trim() || 'Anonymous'
  }

  const handlePublishToggle = async (postId: string, isPublished: boolean) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/blogs/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isPublished: !isPublished,
          publishedAt: !isPublished ? new Date().toISOString() : null
        })
      })

      if (response.ok) {
        toast.success(isPublished ? 'Post unpublished' : 'Post published')
        fetchPosts()
      } else {
        toast.error('Failed to update post')
      }
    } catch (error) {
      toast.error('Failed to update post')
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/blogs/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Blog post deleted')
        fetchPosts()
      } else {
        toast.error('Failed to delete post')
      }
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading blog posts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No blog posts found. Create your first blog post!</p>
        </div>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {getAuthorName(post.author)}
                    </div>
                  </div>
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center space-x-2">
                    {post.category && (
                      <Badge variant="secondary">
                        {post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    )}
                    <Badge variant={post.isPublished ? "default" : "outline"}>
                      {post.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublishToggle(post.id, post.isPublished)}
                  >
                    {post.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Link href={`/blog/${post.slug}`}>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {post.tags.length > 0 && (
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <span key={tag} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  )
} 