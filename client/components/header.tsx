"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Phone, Search, User, LogOut, Shield, Plus, Home, FileText, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import AuthModal from "@/components/auth-modal"
import { useSession, signOut } from "next-auth/react"
import { useAdmin } from "@/hooks/use-admin"

const navItems = [
  { name: "Home", path: "/" },
  { name: "Properties", path: "/properties" },
  { name: "Blog", path: "/blog" },
  { name: "About", path: "/about" },
  { name: "Careers", path: "/careers", newWindow: true },
  { name: "Contact", path: "/contact" },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"properties" | "blog">("properties")
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { isAdmin, adminUser, loading: adminLoading, logout } = useAdmin()

  useEffect(() => {
    const handleScroll = () => {
      // Check if scroll position is more than 10 pixels from the top
      if (window.scrollY > 500) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    handleScroll() 

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Effect to load user data from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        setUserDisplayName(user.firstName || user.email)
      }
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams()
      params.set('search', searchQuery.trim())
      
      if (searchType === "properties") {
        router.push(`/properties?${params.toString()}`)
      } else {
        router.push(`/blog?${params.toString()}`)
      }
      
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' })
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('adminUser')
      localStorage.removeItem('adminToken')
      setUserDisplayName(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleLoginSuccess = (userData: any, adminStatus: boolean) => {
    if (!adminStatus) {
      setUserDisplayName(userData.firstName || userData.email)
    }
    // Handle admin login success
    if (adminStatus) {
      // Force refresh to update admin state
      window.location.reload()
    }
    setAuthModalOpen(false)
  }

  // Determine text color based on scrolled state for high contrast
  const textColor = isScrolled ? "text-gray-900" : "text-slate-200"
  const hoverTextColor = "hover:text-red-600"
  const activeTextColor = "text-red-600 font-bold"

  const headerPadding = "py-"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled 
          // 1. New: bg-gray-100 for light gray background when scrolled
          ? "bg-gray-100 shadow-lg" 
          : "bg-transparent" 
      }`}
    >
      {/* 2. Reduced padding (py-2 for both states) to reduce overall height */}
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${headerPadding}`}>
        <div className="flex items-center justify-between">
          
          {/* Left Section - Logo */}
          <Link href="/" className="flex items-center">
             {/* 3. Significantly reduced logo size to reduce height further */}
            <div className="relative w-[120px] h-[120px] overflow-visible">
              <Image
                src="/logo.PNG"
                alt="The BLX RealtyLogo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Center Section - Navigation */}
          <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                target={item.newWindow ? "_blank" : undefined}
                rel={item.newWindow ? "noopener noreferrer" : undefined}
                className={`text-base font-medium transition-colors relative font-['Suisse_Intl',sans-serif] ${
                  pathname === item.path
                    ? activeTextColor // Red and bold when active
                    // 4. Updated default and hover colors for light gray background
                    : `${textColor} ${hoverTextColor}` 
                }`}
              >
                {item.name}
                {pathname === item.path && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-500"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Section - Search, Admin Actions, Auth Button and Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              // 4. Updated text color for light gray background
              className={`${isScrolled ? "text-gray-900" : "text-white"} hover:text-red-600 transition-colors p-2`}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Admin Add Button (Colors remain the same as it has its own background) */}
            {isAdmin && !adminLoading && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-['Suisse_Intl',sans-serif] font-medium transition-all duration-300 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            )}

            {/* User Session/Login/Admin Display */}
            {userDisplayName ? (
              <div className="flex items-center space-x-2">
                <span className={textColor + " text-sm"}>
                  Welcome, {userDisplayName}
                </span>
                <Button
                  onClick={handleLogout}
                  // 4. Updated text color for light gray background
                  className={`bg-transparent ${textColor} px-4 py-2 font-['Suisse_Intl',sans-serif] font-medium hover:bg-transparent ${hoverTextColor} transition-all duration-300 relative group text-sm`}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : isAdmin && !adminLoading ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-sm" style={{ color: isScrolled ? '#374151' : 'white' }}>
                  <Shield className="h-4 w-4 text-red-600" />
                  <span>Admin: {adminUser?.firstName || adminUser?.email}</span>
                </div>
                <Button
                  onClick={() => {
                    logout()
                    window.location.reload()
                  }}
                  // 4. Updated text color for light gray background
                  className={`bg-transparent ${textColor} px-4 py-2 font-['Suisse_Intl',sans-serif] font-medium hover:bg-transparent ${hoverTextColor} transition-all duration-300 relative group text-sm`}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setAuthModalOpen(true)}
                // 4. Updated text color for light gray background
                className={`bg-transparent ${textColor} px-6 py-2 font-['Suisse_Intl',sans-serif] font-medium hover:bg-transparent ${hoverTextColor} transition-all duration-300 relative group text-base`}
              >
                <span className="relative flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign in
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? (
                // 4. Updated icon color for light gray background
                <X className={`h-6 w-6 ${isScrolled ? "text-gray-900" : "text-white"}`} />
              ) : (
                // 4. Updated icon color for light gray background
                <Menu className={`h-6 w-6 ${isScrolled ? "text-gray-900" : "text-white"}`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content (Keep dark background for readability) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-700 bg-gradient-to-br from-[#011337] via-[#011337]/95 to-[#011337]/90"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  target={item.newWindow ? "_blank" : undefined}
                  rel={item.newWindow ? "noopener noreferrer" : undefined}
                  className={`text-lg py-2 font-['Suisse_Intl',sans-serif] ${
                    pathname === item.path ? "text-red-400 font-medium" : "text-slate-200 hover:text-red-400"
                  }`}
                  onClick={() => !item.newWindow && setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Admin Add Button - Mobile */}
              {isAdmin && !adminLoading && (
                <button
                  onClick={() => {
                    setAddModalOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-['Suisse_Intl',sans-serif] font-medium transition-all duration-300 text-lg"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add</span>
                </button>
              )}

              <div className="pt-4 border-t border-slate-700">
                {userDisplayName ? (
                  <div className="space-y-2">
                    <div className="text-white text-sm">
                      Welcome, {userDisplayName}
                    </div>
                    <Button
                      onClick={handleLogout}
                      className="w-full bg-transparent text-white font-['Suisse_Intl',sans-serif] font-medium hover:bg-transparent hover:text-white transition-all duration-300 relative group text-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : isAdmin && !adminLoading ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-white text-sm">
                      <Shield className="h-4 w-4 text-red-400" />
                      <span>Admin: {adminUser?.firstName || adminUser?.email}</span>
                    </div>
                    <Button
                      onClick={() => {
                        logout() 
                        setMobileMenuOpen(false)
                        window.location.reload() 
                      }}
                      className="w-full bg-transparent text-white font-['Suisse_Intl',sans-serif] font-medium hover:bg-transparent hover:text-white transition-all duration-300 relative group text-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setAuthModalOpen(true)}
                    className="w-full bg-transparent text-white font-['Suisse_Intl',sans-serif] font-medium hover:bg-transparent hover:text-white transition-all duration-300 relative group text-lg"
                  >
                    <span className="relative flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Sign in
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Overlay (No changes needed) */}
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute top-20 left-[40%] transform -translate-x-1/2 w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center p-4">
                  <div className="flex-1 flex items-center">
                    <Search className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search properties or blog posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 outline-none text-lg"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value as "properties" | "blog")}
                      className="bg-transparent text-gray-800 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                    >
                      <option value="properties">Properties</option>
                      <option value="blog">Blog</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Auth Modal (No changes needed) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Add Modal (No changes needed) */}
      <AnimatePresence>
        {addModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setAddModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h3>
                <p className="text-gray-600">Manage your properties and blog posts</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    router.push('/addprop')
                    setAddModalOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center group-hover:bg-red-600 transition-colors">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Add Property</h4>
                    <p className="text-sm text-gray-600">Create a new property listing</p>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    router.push('/admin-blogs/add')
                    setAddModalOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Add Blog Post</h4>
                    <p className="text-sm text-gray-600">Create a new blog article</p>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    router.push('/add-career-posting')
                    setAddModalOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Add Career Posting</h4>
                    <p className="text-sm text-gray-600">Create a new job posting</p>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    router.push('/admin-properties')
                    setAddModalOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Manage Properties</h4>
                    <p className="text-sm text-gray-600">View and delete properties</p>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    router.push('/admin-blogs')
                    setAddModalOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Manage Blog Posts</h4>
                    <p className="text-sm text-gray-600">View and delete blog posts</p>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    router.push('/admin-career-postings')
                    setAddModalOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Manage Career Postings</h4>
                    <p className="text-sm text-gray-600">View and delete job postings</p>
                  </div>
                </button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}