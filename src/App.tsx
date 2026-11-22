import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { HelmetProvider } from "react-helmet-async";


import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import Profile from "./pages/Profile";
import MyBooks from "./pages/MyBooks";
import BookReader from "./pages/BookReader";
import Playground from "./pages/Playground";
import Codelingo from "./pages/Codelingo";
import CodePreview from "./pages/CodePreview";
import MyProjects from "./pages/MyProjects";
import PublicGallery from "./pages/PublicGallery";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import PaymentHistory from "./pages/PaymentHistory";
import Admin from "./pages/Admin";
import AdminBooks from "./pages/AdminBooks";
import AdminCategories from "./pages/AdminCategories";
import AdminUsers from "./pages/AdminUsers";
import AdminChats from "./pages/AdminChats";
import AdminPromoCodes from "./pages/AdminPromoCodes";
import AdminReviews from "./pages/AdminReviews";
// Temporarily disabled AI Tutor
// import AITutor from "./pages/AITutor";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import AdminCourses from "./pages/AdminCourses";
import Credits from "./pages/Credits";
import DirectChat from "./pages/DirectChat";
import FindFriends from "./pages/FindFriends";
import Forums from "./pages/Forums";
import ForumPostDetail from "./pages/ForumPostDetail";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import UserProfile from "./pages/UserProfile";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlog from "./pages/AdminBlog";
import AdminXP from "./pages/AdminXP";
import AdminPayments from "./pages/AdminPayments";
import AdminManualPayments from "./pages/AdminManualPayments";
import AdminBanners from "./pages/AdminBanners";
import AdminBundles from "./pages/AdminBundles";
import AdminActivity from "./pages/AdminActivity";

import NotFound from "./pages/NotFound";
import AdminPricing from "./pages/AdminPricing";
import AdminCredits from "./pages/AdminCredits";
import PaymentStatus from "./pages/PaymentStatus";

const queryClient = new QueryClient();


const App = () => {
  return (
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-books" element={<MyBooks />} />
            <Route path="/read/:id" element={<BookReader />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/codelingo" element={<Codelingo />} />
            <Route path="/code/:id" element={<CodePreview />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/gallery" element={<PublicGallery />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="/payment/history" element={<PaymentHistory />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/books" element={<AdminBooks />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/chats" element={<AdminChats />} />
            <Route path="/admin/promo-codes" element={<AdminPromoCodes />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/xp" element={<AdminXP />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/manual-payments" element={<AdminManualPayments />} />
            <Route path="/admin/banners" element={<AdminBanners />} />
            <Route path="/admin/bundles" element={<AdminBundles />} />
            <Route path="/admin/activity" element={<AdminActivity />} />
            
            {/* Temporarily disabled AI Tutor */}
            {/* <Route path="/ai-tutor" element={<AITutor />} /> */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/direct-chat" element={<DirectChat />} />
            <Route path="/find-friends" element={<FindFriends />} />
            <Route path="/forums" element={<Forums />} />
            <Route path="/forums/:id" element={<ForumPostDetail />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/credits" element={<AdminCredits />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
            <Route path="/payment/status" element={<PaymentStatus />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
