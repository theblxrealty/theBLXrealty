"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, User, ArrowRight, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import BlogCard from "@/components/blog-card"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featuredImage: string | null
  category: string | null
  tags: string[]
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
}

interface BlogPageProps {
  searchParams?: Promise<{
    category?: string
    page?: string
  }>
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // Fetch blog posts from API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory)
        params.append('page', pagination.page.toString())
        params.append('limit', pagination.limit.toString())

        const response = await fetch(`/api/blog/posts?${params.toString()}`)
        const data = await response.json()

        if (data.posts) {
          setBlogPosts(data.posts)
          setPagination(data.pagination)
          
          // Set featured posts (first 3 posts)
          setFeaturedPosts(data.posts.slice(0, 3))
          
          // Extract unique categories
          const uniqueCategories = data.posts
            .map((post: BlogPost) => post.category)
            .filter(Boolean) as string[]
          setCategories([...new Set(uniqueCategories)])
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [selectedCategory, pagination.page])

  useEffect(() => {
    const initializeFromSearchParams = async () => {
      if (searchParams) {
        const params = await searchParams
        setSelectedCategory(params.category || 'all')
      }
    }
    
    initializeFromSearchParams()
  }, [searchParams])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setPagination(prev => ({ ...prev, page: 1 }))
    
    // Update URL without causing page refresh or scroll
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    router.replace(`/blog?${params.toString()}`, { scroll: false })
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleQuickFilter = (filterType: string, value: string) => {
    const params = new URLSearchParams()
    if (filterType === 'category') {
      params.set('category', value)
    } else if (filterType === 'search') {
      params.set('search', value)
    }
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <div className="flex flex-col min-h-screen pt-30">
      {/* Hero Section */}
      <section className="relative w-full h-[100vh] overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <Image
            src="/blog-banner.jpg?height=1080&width=1920"
            alt="Our real estate blog and insights"
            fill
            className="object-cover"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-end pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="text-white animate-fade-in">
                {/* Main Heading */}
                <h1 
                  className="font-bold mb-6 font-serif animate-slide-up" 
                  style={{ fontFamily: 'Tiempos Headline, serif', fontSize: '60px', fontWeight: '400' }}
                >
                  Market Insights & Analysis
                </h1>

                {/* Description */}
                 

                {/* Quick Filter Buttons */}
                {/* <div className="max-w-4xl mx-auto mb-8 animate-slide-up-delay-2">
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuickFilter('category', 'Buying Guide')}
                      className="px-4 py-2 text-sm font-medium rounded-full border border-white/30 text-white hover:bg-white/10 transition-all duration-200"
                    >
                      Buying Guide
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFilter('category', 'Investment')}
                      className="px-4 py-2 text-sm font-medium rounded-full border border-white/30 text-white hover:bg-white/10 transition-all duration-200"
                    >
                      Investment
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFilter('category', 'Legal')}
                      className="px-4 py-2 text-sm font-medium rounded-full border border-white/30 text-white hover:bg-white/10 transition-all duration-200"
                    >
                      Legal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFilter('search', 'bangalore')}
                      className="px-4 py-2 text-sm font-medium rounded-full border border-white/30 text-white hover:bg-white/10 transition-all duration-200"
                    >
                      Bangalore
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFilter('search', 'luxury')}
                      className="px-4 py-2 text-sm font-medium rounded-full border border-white/30 text-white hover:bg-white/10 transition-all duration-200"
                    >
                      Luxury
                    </button>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-navy-900">Featured Articles</h2>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading featured articles...</p>
            </div>
          ) : featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <BlogCard key={post.id} post={post} priority={index === 0} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No featured articles</h3>
              <p className="text-slate-500">Check back later for featured content.</p>
            </div>
          )}
        </div>
      </section>

      {/* All Posts */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-900">All Articles</h2>

            <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full md:w-auto">
              <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="all" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
                  All
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="data-[state=active]:bg-navy-600 data-[state=active]:text-white"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading articles...</p>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                {/* Previous button */}
                {pagination.page > 1 && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 bg-white border-slate-300 hover:bg-slate-50"
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    ←
                  </Button>
                )}
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button 
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "outline"}
                      size="icon" 
                      className={`h-8 w-8 ${pagination.page === pageNum ? 'bg-red-500 text-white' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                
                {/* Next button */}
                {pagination.page < pagination.totalPages && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 bg-white border-slate-300 hover:bg-slate-50"
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    →
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      {/* <section className="py-12 md:py-16 bg-gradient-to-br from-navy-900 via-navy-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg text-slate-200 mb-8">
              Subscribe to our newsletter for exclusive market insights, luxury property updates, and investment opportunities
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:border-gold-400 backdrop-blur-sm"
              />
              <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  )
} 