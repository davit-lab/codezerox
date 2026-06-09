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
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import MyBooks from "./pages/MyBooks";
import BookReader from "./pages/BookReader";
import Playground from "./pages/Playground";
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
import AdminVacancies from "./pages/AdminVacancies";
import AdminHubProjects from "./pages/AdminHubProjects";
import AdminChallenges from "./pages/AdminChallenges";
import AdminFreelancers from "./pages/AdminFreelancers";
import AdminReviews from "./pages/AdminReviews";
// Temporarily disabled AI Tutor
// import AITutor from "./pages/AITutor";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import AdminCourses from "./pages/AdminCourses";
import Credits from "./pages/Credits";
import Hub from "./pages/Hub";
import Vacancies from "./pages/Vacancies";
import VacancyDetail from "./pages/VacancyDetail";
import CreateVacancy from "./pages/CreateVacancy";
import VacancyInbox from "./pages/VacancyInbox";
import FreelancerBrowse from "./pages/FreelancerBrowse";
import FreelancerDetail from "./pages/FreelancerDetail";
import FreelancerProfile from "./pages/FreelancerProfile";
// Temporarily disabled AI packages
// import PostingPackages from "./pages/PostingPackages";
import PackageCheckout from "./pages/PackageCheckout";
import DirectChat from "./pages/DirectChat";
import FindFriends from "./pages/FindFriends";
import Forums from "./pages/Forums";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import UserProfile from "./pages/UserProfile";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlog from "./pages/AdminBlog";
import AdminXP from "./pages/AdminXP";
import AdminPayments from "./pages/AdminPayments";
import AdminManualPayments from "./pages/AdminManualPayments";
import AdminExams from "./pages/AdminExams";
import AdminBanners from "./pages/AdminBanners";
import AdminBundles from "./pages/AdminBundles";
import AdminActivity from "./pages/AdminActivity";
import AdminKids from "./pages/AdminKids";
import AdminMentoring from "./pages/AdminMentoring";
import Mentoring from "./pages/Mentoring";
import MentoringDetail from "./pages/MentoringDetail";
import MentoringHub from "./pages/MentoringHub";
import VideoCourses from "./pages/VideoCourses";
import VideoCourseDetail from "./pages/VideoCourseDetail";
import VideoPlayer from "./pages/VideoPlayer";
import AdminVideoCourses from "./pages/AdminVideoCourses";

import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail";
import Leaderboard from "./pages/Leaderboard";
import Certifications from "./pages/Certifications";
import ExamPage from "./pages/ExamPage";
import CertificateView from "./pages/CertificateView";
import Kids from "./pages/Kids";
import KidsPuzzle from "./pages/KidsPuzzle";
import KidsEditor from "./pages/KidsEditor";
import KidsChallenge from "./pages/KidsChallenge";
import KidsLogin from "./pages/KidsLogin";
import ParentDashboard from "./pages/ParentDashboard";
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
            <Route path="/categories" element={<Categories />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-books" element={<MyBooks />} />
            <Route path="/read/:id" element={<BookReader />} />
            <Route path="/playground" element={<Playground />} />
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
            <Route path="/admin/vacancies" element={<AdminVacancies />} />
            <Route path="/admin/hub-projects" element={<AdminHubProjects />} />
            <Route path="/admin/challenges" element={<AdminChallenges />} />
            <Route path="/admin/freelancers" element={<AdminFreelancers />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/xp" element={<AdminXP />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/manual-payments" element={<AdminManualPayments />} />
            <Route path="/admin/exams" element={<AdminExams />} />
            <Route path="/admin/banners" element={<AdminBanners />} />
            <Route path="/admin/bundles" element={<AdminBundles />} />
            <Route path="/admin/activity" element={<AdminActivity />} />
            <Route path="/admin/kids" element={<AdminKids />} />
            <Route path="/admin/mentoring" element={<AdminMentoring />} />
            <Route path="/mentoring" element={<Mentoring />} />
            <Route path="/mentoring/:slug" element={<MentoringDetail />} />
            <Route path="/mentoring/:slug/hub" element={<MentoringHub />} />
            <Route path="/video-courses" element={<VideoCourses />} />
            <Route path="/video-courses/:id" element={<VideoCourseDetail />} />
            <Route path="/video-courses/:courseId/watch/:lectureId" element={<VideoPlayer />} />
            <Route path="/admin/video-courses" element={<AdminVideoCourses />} />
            
            {/* Temporarily disabled AI Tutor */}
            {/* <Route path="/ai-tutor" element={<AITutor />} /> */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/community" element={<Hub />} />
            <Route path="/hub" element={<Hub />} />
            <Route path="/vacancies" element={<Vacancies />} />
            <Route path="/vacancies/create" element={<CreateVacancy />} />
            <Route path="/vacancies/edit/:id" element={<CreateVacancy />} />
            <Route path="/vacancies/inbox" element={<VacancyInbox />} />
            <Route path="/vacancies/:id" element={<VacancyDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/create" element={<CreateProject />} />
            <Route path="/projects/edit/:id" element={<CreateProject />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/freelancers" element={<FreelancerBrowse />} />
            <Route path="/freelancer/edit" element={<FreelancerProfile />} />
            <Route path="/freelancer/:id" element={<FreelancerDetail />} />
            {/* Temporarily disabled AI packages */}
            {/* <Route path="/packages" element={<PostingPackages />} /> */}
            <Route path="/package-checkout" element={<PackageCheckout />} />
            <Route path="/chat" element={<DirectChat />} />
            <Route path="/direct-chat" element={<DirectChat />} />
            <Route path="/find-friends" element={<FindFriends />} />
            <Route path="/forums" element={<Forums />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/exam/:slug" element={<ExamPage />} />
            <Route path="/certificate/:id" element={<CertificateView />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            
            <Route path="/kids" element={<Kids />} />
            <Route path="/kids/login" element={<KidsLogin />} />
            <Route path="/kids/puzzle/:id" element={<KidsPuzzle />} />
            <Route path="/kids/editor/:id" element={<KidsEditor />} />
            <Route path="/kids/challenge/:id" element={<KidsChallenge />} />
            <Route path="/parent" element={<ParentDashboard />} />
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
