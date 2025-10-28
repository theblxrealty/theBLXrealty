"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

interface BlogCardProps {
  post: BlogPost
  priority?: boolean
}

export default function BlogCard({ post, priority = false }: BlogCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case "Buying Guide":
        return "bg-navy-600"
      case "Selling Tips":
        return "bg-gold-600"
      case "Investment":
        return "bg-slate-600"
      case "Market Analysis":
        return "bg-emerald-600"
      case "Legal":
        return "bg-purple-600"
      case "Real Estate":
        return "bg-red-600"
      case "Market Updates":
        return "bg-blue-600"
      case "Tips & Advice":
        return "bg-green-600"
      case "News":
        return "bg-orange-600"
      default:
        return "bg-slate-600"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Draft"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getAuthorName = () => {
    return "The BLX Realty"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0 }}
      viewport={{ once: true }}
      className="bg-gray-50 transition-all duration-300 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title and Category - ABOVE the image */}
      <div className="p-4 pb-2">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-1 leading-tight" style={{fontFamily: 'Tiempos Headline, serif', fontWeight: '400'}}>
          {post.title}
        </h3>
        {post.category && (
          <p className="text-sm text-amber-700 font-medium">
            {post.category}
          </p>
        )}
      </div>

      {/* Image Section - BELOW the title */}
      <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden bg-gray-200">
        <motion.div
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.4 }}
          className="w-full h-full"
        >
          <Image 
            src={post.featuredImage || "/placeholder.svg"} 
            alt={post.title} 
            fill 
            priority={priority}
            className="object-cover object-center" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>

        {/* Published Date Overlay - Top Right */}
        <div className="absolute top-4 right-4 bg-white/95 rounded-full px-4 py-2">
          <p className="text-sm font-bold text-amber-700">
            {formatDate(post.publishedAt)}
          </p>
        </div>

        {/* Image Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 hover:opacity-100 transition-opacity">
          <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Featured Badge */}
        {post.publishedAt && (
          <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 text-xs">
            Published
          </Badge>
        )}
      </div>

      {/* Blog Details - At the bottom */}
      <div className="p-4 pt-2">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span>{getAuthorName()}</span>
          </div>
        </div>
        
        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {post.excerpt}
          </p>
        )}

        {/* Read More Link - Only clickable element */}
        <Link href={`/blog/${post.slug}`}>
          <div className="flex items-center text-amber-700 hover:text-amber-800 transition-colors cursor-pointer">
            <span className="text-sm font-medium">Read More</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </Link>
      </div>
    </motion.div>
  )
} 