import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { Book } from './useBooks';
import { CreditPackage } from './useCredits';
import { Course } from './useCourses';
import { BookSubscriptionPlan } from './useBookSubscriptions';

export interface GiftInfo {
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  recipientAvatar?: string | null;
  isAnonymous: boolean;
  message?: string;
}

export interface CartItem {
  book: Book;
  addedAt: string;
  giftInfo?: GiftInfo;
}

export interface CreditCartItem {
  package: CreditPackage;
  addedAt: string;
}

export interface CourseCartItem {
  course: Course;
  addedAt: string;
}

export interface SubscriptionCartItem {
  plan: BookSubscriptionPlan;
  addedAt: string;
}


interface CartStore {
  items: CartItem[];
  creditItems: CreditCartItem[];
  courseItems: CourseCartItem[];
  subscriptionItem: SubscriptionCartItem | null;
  addItem: (book: Book, giftInfo?: GiftInfo) => void;
  removeItem: (bookId: string) => void;
  addCreditPackage: (pkg: CreditPackage) => void;
  removeCreditPackage: (packageId: string) => void;
  addCourseItem: (course: Course) => void;
  removeCourseItem: (courseId: string) => void;
  addSubscription: (plan: BookSubscriptionPlan) => void;
  removeSubscription: () => void;
  clearCart: () => void;
  clearCredits: () => void;
  isInCart: (bookId: string) => boolean;
  isCreditInCart: (packageId: string) => boolean;
  isCourseInCart: (courseId: string) => boolean;
  isSubscriptionInCart: () => boolean;
  getTotal: () => number;
  getCreditTotal: () => number;
  getCourseTotal: () => number;
  getSubscriptionTotal: () => number;
  getGrandTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      creditItems: [],
      courseItems: [],
      subscriptionItem: null,
      
      addItem: (book: Book, giftInfo?: GiftInfo) => {
        const { items } = get();
        if (!giftInfo && items.some(item => item.book.id === book.id && !item.giftInfo)) return;
        if (giftInfo && items.some(item => item.book.id === book.id && item.giftInfo?.recipientId === giftInfo.recipientId)) return;
        set({ items: [...items, { book, addedAt: new Date().toISOString(), giftInfo }] });
      },
      
      removeItem: (bookId: string) => {
        set({ items: get().items.filter(item => item.book.id !== bookId) });
      },
      
      addCreditPackage: (pkg: CreditPackage) => {
        set({ creditItems: [{ package: pkg, addedAt: new Date().toISOString() }] });
      },
      
      removeCreditPackage: (packageId: string) => {
        set({ creditItems: get().creditItems.filter(item => item.package.id !== packageId) });
      },

      addCourseItem: (course: Course) => {
        const { courseItems } = get();
        if (courseItems.some(item => item.course.id === course.id)) return;
        set({ courseItems: [...courseItems, { course, addedAt: new Date().toISOString() }] });
      },

      removeCourseItem: (courseId: string) => {
        set({ courseItems: get().courseItems.filter(item => item.course.id !== courseId) });
      },
      
      addSubscription: (plan: BookSubscriptionPlan) => {
        set({ subscriptionItem: { plan, addedAt: new Date().toISOString() } });
      },
      
      removeSubscription: () => {
        set({ subscriptionItem: null });
      },

      
      clearCart: () => set({ items: [], creditItems: [], courseItems: [], subscriptionItem: null }),
      
      clearCredits: () => set({ creditItems: [] }),
      
      isInCart: (bookId: string) => get().items.some(item => item.book.id === bookId),
      
      isCreditInCart: (packageId: string) => get().creditItems.some(item => item.package.id === packageId),

      isCourseInCart: (courseId: string) => get().courseItems.some(item => item.course.id === courseId),
      
      isSubscriptionInCart: () => get().subscriptionItem !== null,
      
      getTotal: () => get().items.reduce((total, item) => total + (item.book.is_free ? 0 : item.book.price), 0),
      
      getCreditTotal: () => get().creditItems.reduce((total, item) => total + item.package.price_gel, 0),

      getCourseTotal: () => get().courseItems.reduce((total, item) => total + item.course.monthly_price, 0),
      
      getSubscriptionTotal: () => get().subscriptionItem?.plan.price_gel || 0,

      getGrandTotal: () => get().getTotal() + get().getCreditTotal() + get().getCourseTotal() + get().getSubscriptionTotal(),
      
      getItemCount: () => get().items.length + get().creditItems.length + get().courseItems.length + (get().subscriptionItem ? 1 : 0),
    }),
    { name: 'cart-storage' }
  )
);
