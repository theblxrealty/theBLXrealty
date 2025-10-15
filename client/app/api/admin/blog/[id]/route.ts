import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

// Middleware to verify admin token
const verifyAdminToken = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  
  if (!decoded || decoded.type !== 'admin') {
    return null
  }

  return decoded
}

const BlogPostUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required").optional(),
  featuredImage: z.string().url().or(z.literal("")).nullable().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  authorId: z.string().optional(), // Add authorId to schema
}).strict()

// GET - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Get blog post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const validatedData = BlogPostUpdateSchema.safeParse(body)
    if (!validatedData.success) {
      console.error("Validation Error:", validatedData.error.errors)
      return NextResponse.json(
        { error: validatedData.error.errors },
        { status: 400 }
      )
    }

    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      isPublished,
      publishedAt,
      authorId // Add authorId to data
    } = validatedData.data

    // Check if slug already exists (if slug is being changed)
    if (slug) {
      const existingPost = await prisma.blogPost.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      })

      if (existingPost) {
        return NextResponse.json(
          { error: 'A blog post with this slug already exists' },
          { status: 409 }
        )
      }
    }

    const post = await prisma.blogPost.update({
      where: { id: id },
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        category,
        tags,
        isPublished,
        publishedAt,
        authorId // Add authorId to data
      }
    })

    // If the post is being published, send newsletter emails
    if (isPublished && publishedAt) {
      try {
        // Send newsletter emails asynchronously (don't wait for completion)
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/newsletter/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blogId: id }),
        }).catch(error => {
          console.error('Failed to send newsletter emails:', error)
        })
      } catch (error) {
        console.error('Error triggering newsletter send:', error)
      }
    }

    return NextResponse.json({
      message: 'Blog post updated successfully',
      post
    })

  } catch (error) {
    console.error('Update blog post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    await prisma.blogPost.delete({
      where: { id: id }
    })

    return NextResponse.json({
      message: 'Blog post deleted successfully'
    })

  } catch (error) {
    console.error('Delete blog post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 