import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

// POST - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    
    if (!decoded || decoded.type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      featuredImage
    } = body

    // Convert tags string to array if needed
    const tagsArray = typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : Array.isArray(tags) ? tags : []

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    try {
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug }
      })

      if (existingPost) {
        return NextResponse.json(
          { error: 'A blog post with this title already exists' },
          { status: 400 }
        )
      }
    } catch (dbError) {
      console.error('Database error during slug check:', dbError)
      return NextResponse.json(
        { error: 'Database error during validation' },
        { status: 500 }
      )
    }

    // Use the provided featured image URL (already uploaded by client)
    const featuredImageUrl = featuredImage || null

    // Create blog post in database

    let blogPost
    try {
      blogPost = await prisma.blogPost.create({
        data: {
          title: title.trim(),
          slug,
          excerpt: excerpt?.trim(),
          content: content.trim(),
          featuredImage: featuredImageUrl,
          category: category?.trim(),
          tags: tagsArray,
          authorId: decoded.id, // Revert to using decoded.id
          isPublished: true, // Auto-publish for admin uploads
          publishedAt: new Date()
        },
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

      // Send newsletter to subscribers
      try {
        const subscribers = await prisma.newsletterSubscription.findMany({
          where: { isActive: true },
          select: { email: true }
        })

        const blogPostUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${blogPost.slug}`

        for (const subscriber of subscribers) {
          await sendEmail({
            to: subscriber.email,
            subject: `New Blog Post: ${blogPost.title}`,
            html: `
              <h1>${blogPost.title}</h1>
              <p>${blogPost.excerpt || 'Read our latest blog post!'}</p>
              <a href="${blogPostUrl}">Read More</a>
              <p>You received this email because you subscribed to our newsletter. </p>
              <p>To unsubscribe, please visit: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/unsubscribe">Unsubscribe</a></p>
            `
          })
        }
        console.log(`Sent new blog post notification to ${subscribers.length} subscribers.`)
      } catch (emailError) {
        console.error('Error sending newsletter email:', emailError)
        // Continue processing even if email sending fails
      }

      return NextResponse.json({
        success: true,
        blogPost,
        message: 'Blog post created successfully'
      })

    } catch (createError) {
      console.error('Database error during blog post creation:', createError)
      return NextResponse.json(
        { error: 'Failed to create blog post' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Create blog post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Get all blog posts for admin
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.blogPost.count()
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get blog posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
