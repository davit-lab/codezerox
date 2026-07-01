export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          page_path: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          page_path?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          page_path?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          book_id: string | null
          content: string
          conversation_id: string | null
          created_at: string
          credits_used: number | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          book_id?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string
          credits_used?: number | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          book_id?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string
          credits_used?: number | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bank_transactions: {
        Row: {
          amount: number
          bank_order_id: string | null
          bank_status: string | null
          callback_received_at: string | null
          created_at: string
          currency: string
          discount_amount: number | null
          error_message: string | null
          id: string
          items: Json | null
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_order_id?: string | null
          bank_status?: string | null
          callback_received_at?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          error_message?: string | null
          id?: string
          items?: Json | null
          provider: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_order_id?: string | null
          bank_status?: string | null
          callback_received_at?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          error_message?: string | null
          id?: string
          items?: Json | null
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id: string
          content?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string
          content?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      book_bookmarks: {
        Row: {
          book_id: string
          color: string | null
          created_at: string
          id: string
          note: string | null
          page_number: number
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          color?: string | null
          created_at?: string
          id?: string
          note?: string | null
          page_number: number
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          color?: string | null
          created_at?: string
          id?: string
          note?: string | null
          page_number?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_bookmarks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_bundle_items: {
        Row: {
          book_id: string
          bundle_id: string
          id: string
        }
        Insert: {
          book_id: string
          bundle_id: string
          id?: string
        }
        Update: {
          book_id?: string
          bundle_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_bundle_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "book_bundles"
            referencedColumns: ["id"]
          },
        ]
      }
      book_bundles: {
        Row: {
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      book_reviews: {
        Row: {
          book_id: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_updates: {
        Row: {
          book_id: string
          created_at: string
          description: string | null
          id: string
          is_free: boolean
          pages: number | null
          pdf_url: string | null
          price: number
          version_name: string
        }
        Insert: {
          book_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          pages?: number | null
          pdf_url?: string | null
          price?: number
          version_name?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          pages?: number | null
          pdf_url?: string | null
          price?: number
          version_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_updates_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string
          category_id: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_free: boolean | null
          is_new: boolean | null
          is_popular: boolean | null
          pages: number | null
          pdf_url: string | null
          price: number
          rating: number | null
          rating_count: number | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          pages?: number | null
          pdf_url?: string | null
          price?: number
          rating?: number | null
          rating_count?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean | null
          is_new?: boolean | null
          is_popular?: boolean | null
          pages?: number | null
          pdf_url?: string | null
          price?: number
          rating?: number | null
          rating_count?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          call_type: Database["public"]["Enums"]["call_type"]
          caller_id: string
          conversation_id: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          receiver_id: string
          started_at: string
          status: Database["public"]["Enums"]["call_status"]
        }
        Insert: {
          call_type?: Database["public"]["Enums"]["call_type"]
          caller_id: string
          conversation_id: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          receiver_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["call_status"]
        }
        Update: {
          call_type?: Database["public"]["Enums"]["call_type"]
          caller_id?: string
          conversation_id?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          receiver_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["call_status"]
        }
        Relationships: []
      }
      categories: {
        Row: {
          book_count: number | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          book_count?: number | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          book_count?: number | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          attempt_id: string
          certificate_number: string
          exam_id: string
          id: string
          issued_at: string
          user_id: string
        }
        Insert: {
          attempt_id: string
          certificate_number: string
          exam_id: string
          id?: string
          issued_at?: string
          user_id: string
        }
        Update: {
          attempt_id?: string
          certificate_number?: string
          exam_id?: string
          id?: string
          issued_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "certification_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      certification_exams: {
        Row: {
          category: string
          created_at: string
          description: string | null
          final_assignment: string | null
          id: string
          is_active: boolean
          name: string
          pass_threshold: number
          price_gel: number
          slug: string
          subcategory: string | null
          time_limit_minutes: number
          total_questions: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          final_assignment?: string | null
          id?: string
          is_active?: boolean
          name: string
          pass_threshold?: number
          price_gel?: number
          slug: string
          subcategory?: string | null
          time_limit_minutes?: number
          total_questions?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          final_assignment?: string | null
          id?: string
          is_active?: boolean
          name?: string
          pass_threshold?: number
          price_gel?: number
          slug?: string
          subcategory?: string | null
          time_limit_minutes?: number
          total_questions?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_admin: boolean | null
          is_read: boolean | null
          room_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_admin?: boolean | null
          is_read?: boolean | null
          room_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_admin?: boolean | null
          is_read?: boolean | null
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_quick_replies: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      code_snippets: {
        Row: {
          created_at: string
          css_code: string
          hide_code: boolean
          html_code: string
          id: string
          is_public: boolean
          js_code: string
          language: string
          title: string
          updated_at: string
          user_id: string | null
          views: number
        }
        Insert: {
          created_at?: string
          css_code?: string
          hide_code?: boolean
          html_code?: string
          id?: string
          is_public?: boolean
          js_code?: string
          language?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          views?: number
        }
        Update: {
          created_at?: string
          css_code?: string
          hide_code?: boolean
          html_code?: string
          id?: string
          is_public?: boolean
          js_code?: string
          language?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          views?: number
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          channel: string
          content: string
          created_at: string
          id: string
          message_type: string
          project_url: string | null
          reply_to: string | null
          upvote_count: number
          user_id: string
        }
        Insert: {
          channel?: string
          content: string
          created_at?: string
          id?: string
          message_type?: string
          project_url?: string | null
          reply_to?: string | null
          upvote_count?: number
          user_id: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          project_url?: string | null
          reply_to?: string | null
          upvote_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      course_chapter_reads: {
        Row: {
          chapter_id: string
          course_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          course_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          course_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_chapter_reads_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "course_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_chapter_reads_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_chapters: {
        Row: {
          chapter_number: number
          code_template: string | null
          content: string | null
          content_type: string | null
          course_id: string
          created_at: string
          description: string | null
          expected_output: string | null
          id: string
          quiz_data: Json | null
          terminal_commands: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          chapter_number: number
          code_template?: string | null
          content?: string | null
          content_type?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          expected_output?: string | null
          id?: string
          quiz_data?: Json | null
          terminal_commands?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          chapter_number?: number
          code_template?: string | null
          content?: string | null
          content_type?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          expected_output?: string | null
          id?: string
          quiz_data?: Json | null
          terminal_commands?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_purchases: {
        Row: {
          course_id: string
          id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_subscriptions: {
        Row: {
          chapters_read_this_month: number
          course_id: string
          created_at: string
          expires_at: string
          granted_by: string | null
          id: string
          last_chapter_generated_at: string | null
          month_reset_at: string
          starts_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chapters_read_this_month?: number
          course_id: string
          created_at?: string
          expires_at: string
          granted_by?: string | null
          id?: string
          last_chapter_generated_at?: string | null
          month_reset_at?: string
          starts_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chapters_read_this_month?: number
          course_id?: string
          created_at?: string
          expires_at?: string
          granted_by?: string | null
          id?: string
          last_chapter_generated_at?: string | null
          month_reset_at?: string
          starts_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_subscriptions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_hours: number | null
          id: string
          is_published: boolean | null
          monthly_price: number
          price: number
          title: string
          total_chapters: number
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_hours?: number | null
          id?: string
          is_published?: boolean | null
          monthly_price?: number
          price?: number
          title: string
          total_chapters?: number
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_hours?: number | null
          id?: string
          is_published?: boolean | null
          monthly_price?: number
          price?: number
          title?: string
          total_chapters?: number
          updated_at?: string
        }
        Relationships: []
      }
      credit_audit_log: {
        Row: {
          action: string
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          id: string
          performed_by: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          action: string
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          id?: string
          performed_by?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          id?: string
          performed_by?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          created_at: string
          credits: number
          description: string | null
          id: string
          is_popular: boolean | null
          name: string
          price_gel: number
        }
        Insert: {
          created_at?: string
          credits: number
          description?: string | null
          id?: string
          is_popular?: boolean | null
          name: string
          price_gel: number
        }
        Update: {
          created_at?: string
          credits?: number
          description?: string | null
          id?: string
          is_popular?: boolean | null
          name?: string
          price_gel?: number
        }
        Relationships: []
      }
      credit_purchases: {
        Row: {
          amount_gel: number
          created_at: string
          credits: number
          id: string
          package_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_gel: number
          created_at?: string
          credits: number
          id?: string
          package_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_gel?: number
          created_at?: string
          credits?: number
          id?: string
          package_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "credit_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      cyberrange_attempts: {
        Row: {
          challenge_id: string
          id: string
          ip_hash: string | null
          submitted_at: string
          success: boolean
          user_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          ip_hash?: string | null
          submitted_at?: string
          success?: boolean
          user_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          ip_hash?: string | null
          submitted_at?: string
          success?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cyberrange_attempts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "cyberrange_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      cyberrange_categories: {
        Row: {
          color: string | null
          created_at: string
          description_ka: string | null
          icon: string | null
          id: string
          name_en: string
          name_ka: string
          slug: string
          sort: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description_ka?: string | null
          icon?: string | null
          id?: string
          name_en: string
          name_ka: string
          slug: string
          sort?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description_ka?: string | null
          icon?: string | null
          id?: string
          name_en?: string
          name_ka?: string
          slug?: string
          sort?: number | null
        }
        Relationships: []
      }
      cyberrange_challenge_hints: {
        Row: {
          challenge_id: string
          cost_pct: number
          created_at: string
          hint_md: string
          id: string
          sort: number
        }
        Insert: {
          challenge_id: string
          cost_pct?: number
          created_at?: string
          hint_md: string
          id?: string
          sort?: number
        }
        Update: {
          challenge_id?: string
          cost_pct?: number
          created_at?: string
          hint_md?: string
          id?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "cyberrange_challenge_hints_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "cyberrange_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      cyberrange_challenges: {
        Row: {
          artifact_path: string | null
          author_user_id: string | null
          base_points: number
          category_id: string | null
          created_at: string
          custom_css: string | null
          custom_html: string | null
          custom_js: string | null
          difficulty: string
          dynamic_scoring: boolean | null
          engine: string
          flag_format: string | null
          flag_hash: string
          id: string
          is_free: boolean | null
          min_rank_points: number | null
          price_credits: number | null
          price_gel: number | null
          published_at: string | null
          rating: number | null
          scenario: Json | null
          simulation_config: Json | null
          slug: string
          solves_count: number
          source: string
          status: string
          story_md: string
          tags: string[] | null
          title_en: string | null
          title_ka: string
        }
        Insert: {
          artifact_path?: string | null
          author_user_id?: string | null
          base_points?: number
          category_id?: string | null
          created_at?: string
          custom_css?: string | null
          custom_html?: string | null
          custom_js?: string | null
          difficulty?: string
          dynamic_scoring?: boolean | null
          engine?: string
          flag_format?: string | null
          flag_hash: string
          id?: string
          is_free?: boolean | null
          min_rank_points?: number | null
          price_credits?: number | null
          price_gel?: number | null
          published_at?: string | null
          rating?: number | null
          scenario?: Json | null
          simulation_config?: Json | null
          slug: string
          solves_count?: number
          source?: string
          status?: string
          story_md?: string
          tags?: string[] | null
          title_en?: string | null
          title_ka: string
        }
        Update: {
          artifact_path?: string | null
          author_user_id?: string | null
          base_points?: number
          category_id?: string | null
          created_at?: string
          custom_css?: string | null
          custom_html?: string | null
          custom_js?: string | null
          difficulty?: string
          dynamic_scoring?: boolean | null
          engine?: string
          flag_format?: string | null
          flag_hash?: string
          id?: string
          is_free?: boolean | null
          min_rank_points?: number | null
          price_credits?: number | null
          price_gel?: number | null
          published_at?: string | null
          rating?: number | null
          scenario?: Json | null
          simulation_config?: Json | null
          slug?: string
          solves_count?: number
          source?: string
          status?: string
          story_md?: string
          tags?: string[] | null
          title_en?: string | null
          title_ka?: string
        }
        Relationships: [
          {
            foreignKeyName: "cyberrange_challenges_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "cyberrange_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cyberrange_hint_reveals: {
        Row: {
          challenge_id: string
          hint_id: string | null
          id: string
          revealed_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          hint_id?: string | null
          id?: string
          revealed_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          hint_id?: string | null
          id?: string
          revealed_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cyberrange_purchases: {
        Row: {
          amount_gel: number | null
          challenge_id: string
          credits_used: number | null
          id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          amount_gel?: number | null
          challenge_id: string
          credits_used?: number | null
          id?: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          amount_gel?: number | null
          challenge_id?: string
          credits_used?: number | null
          id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cyberrange_purchases_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "cyberrange_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      cyberrange_ranks: {
        Row: {
          badge_color: string | null
          id: string
          min_points: number
          name_en: string
          name_ka: string
          slug: string
          sort: number
        }
        Insert: {
          badge_color?: string | null
          id?: string
          min_points?: number
          name_en: string
          name_ka: string
          slug: string
          sort?: number
        }
        Update: {
          badge_color?: string | null
          id?: string
          min_points?: number
          name_en?: string
          name_ka?: string
          slug?: string
          sort?: number
        }
        Relationships: []
      }
      cyberrange_solves: {
        Row: {
          challenge_id: string
          first_blood: boolean | null
          hints_used: number | null
          id: string
          points_awarded: number
          solved_at: string
          time_to_solve_s: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          first_blood?: boolean | null
          hints_used?: number | null
          id?: string
          points_awarded: number
          solved_at?: string
          time_to_solve_s?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          first_blood?: boolean | null
          hints_used?: number | null
          id?: string
          points_awarded?: number
          solved_at?: string
          time_to_solve_s?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cyberrange_solves_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "cyberrange_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      cyberrange_user_stats: {
        Row: {
          last_solve_at: string | null
          rank_slug: string | null
          solves_count: number
          streak_days: number | null
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          last_solve_at?: string | null
          rank_slug?: string | null
          solves_count?: number
          streak_days?: number | null
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          last_solve_at?: string | null
          rank_slug?: string | null
          solves_count?: number
          streak_days?: number | null
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cyberrange_writeups: {
        Row: {
          challenge_id: string
          content_md: string
          created_at: string
          id: string
          status: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          content_md: string
          created_at?: string
          id?: string
          status?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          content_md?: string
          created_at?: string
          id?: string
          status?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cyberrange_writeups_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "cyberrange_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_conversations: {
        Row: {
          created_at: string
          id: string
          participant_one: string
          participant_two: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_one: string
          participant_two: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_one?: string
          participant_two?: string
          updated_at?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          is_voice_message: boolean | null
          sender_id: string
          voice_duration: number | null
          voice_url: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          is_voice_message?: boolean | null
          sender_id: string
          voice_duration?: number | null
          voice_url?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          is_voice_message?: boolean | null
          sender_id?: string
          voice_duration?: number | null
          voice_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "direct_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      exam_assignment_submissions: {
        Row: {
          admin_feedback: string | null
          content: string
          created_at: string
          exam_id: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_feedback?: string | null
          content: string
          created_at?: string
          exam_id: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_feedback?: string | null
          content?: string
          created_at?: string
          exam_id?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_assignment_submissions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "certification_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          answers: Json | null
          completed_at: string | null
          created_at: string
          exam_id: string
          id: string
          passed: boolean
          score: number
          started_at: string
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string
          exam_id: string
          id?: string
          passed?: boolean
          score?: number
          started_at?: string
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string
          exam_id?: string
          id?: string
          passed?: boolean
          score?: number
          started_at?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "certification_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_purchases: {
        Row: {
          amount_gel: number
          attempt_id: string | null
          consumed_at: string | null
          created_at: string
          exam_id: string
          id: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount_gel?: number
          attempt_id?: string | null
          consumed_at?: string | null
          created_at?: string
          exam_id: string
          id?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount_gel?: number
          attempt_id?: string | null
          consumed_at?: string | null
          created_at?: string
          exam_id?: string
          id?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_purchases_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_purchases_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "certification_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_purchases_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          correct_option: string
          created_at: string
          difficulty: string
          exam_id: string
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          sort_order: number
        }
        Insert: {
          correct_option: string
          created_at?: string
          difficulty?: string
          exam_id: string
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          sort_order?: number
        }
        Update: {
          correct_option?: string
          created_at?: string
          difficulty?: string
          exam_id?: string
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question_text?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "certification_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string
          category: string
          comments_count: number
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          likes_count: number
          tags: string[]
          title: string
          updated_at: string
          video_url: string | null
          views_count: number
        }
        Insert: {
          author_id: string
          category?: string
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          likes_count?: number
          tags?: string[]
          title: string
          updated_at?: string
          video_url?: string | null
          views_count?: number
        }
        Update: {
          author_id?: string
          category?: string
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          likes_count?: number
          tags?: string[]
          title?: string
          updated_at?: string
          video_url?: string | null
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      freelancer_profiles: {
        Row: {
          availability: string
          bio: string | null
          created_at: string
          experience_level: string | null
          hourly_rate: number | null
          id: string
          languages: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string
          bio?: string | null
          created_at?: string
          experience_level?: string | null
          hourly_rate?: number | null
          id?: string
          languages?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string
          bio?: string | null
          created_at?: string
          experience_level?: string | null
          hourly_rate?: number | null
          id?: string
          languages?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      freelancer_projects: {
        Row: {
          created_at: string
          description: string | null
          github_url: string | null
          id: string
          image_url: string | null
          live_url: string | null
          profile_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          live_url?: string | null
          profile_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          live_url?: string | null
          profile_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "freelancer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_reviews: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "freelancer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_skills: {
        Row: {
          id: string
          profile_id: string
          skill_name: string
        }
        Insert: {
          id?: string
          profile_id: string
          skill_name: string
        }
        Update: {
          id?: string
          profile_id?: string
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "freelancer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_subscriptions: {
        Row: {
          amount_gel: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          reminder_sent_at: string | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_gel?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reminder_sent_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_gel?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reminder_sent_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          id: string
          initiator_id: string | null
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiator_id?: string | null
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          initiator_id?: string | null
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "friends_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "friends_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      gifts: {
        Row: {
          book_id: string | null
          created_at: string
          credits_amount: number | null
          gift_type: string
          id: string
          is_anonymous: boolean
          is_seen: boolean
          message: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string
          credits_amount?: number | null
          gift_type?: string
          id?: string
          is_anonymous?: boolean
          is_seen?: boolean
          message?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          book_id?: string | null
          created_at?: string
          credits_amount?: number | null
          gift_type?: string
          id?: string
          is_anonymous?: boolean
          is_seen?: boolean
          message?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gifts_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_banners: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          page_key: string
          page_label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          page_key: string
          page_label: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          page_key?: string
          page_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      hub_project_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hub_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_project_likes: {
        Row: {
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_project_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "hub_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_projects: {
        Row: {
          created_at: string
          description: string | null
          github_url: string | null
          id: string
          live_url: string | null
          screenshot_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          live_url?: string | null
          screenshot_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          live_url?: string | null
          screenshot_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      kids_book_purchases: {
        Row: {
          book_id: string
          child_id: string
          id: string
          parent_id: string
          purchased_at: string
        }
        Insert: {
          book_id: string
          child_id: string
          id?: string
          parent_id: string
          purchased_at?: string
        }
        Update: {
          book_id?: string
          child_id?: string
          id?: string
          parent_id?: string
          purchased_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kids_book_purchases_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      kids_lesson_progress: {
        Row: {
          child_id: string
          completed_at: string
          id: string
          lesson_id: string
          xp_earned: number
        }
        Insert: {
          child_id: string
          completed_at?: string
          id?: string
          lesson_id: string
          xp_earned?: number
        }
        Update: {
          child_id?: string
          completed_at?: string
          id?: string
          lesson_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      kids_subscriptions: {
        Row: {
          amount_gel: number
          child_id: string
          created_at: string
          expires_at: string
          id: string
          parent_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_gel?: number
          child_id: string
          created_at?: string
          expires_at: string
          id?: string
          parent_id: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_gel?: number
          child_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          parent_id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      manual_payment_links: {
        Row: {
          amount: number | null
          book_id: string | null
          callback_token: string
          created_at: string
          currency: string
          description: string | null
          id: string
          intended_user_id: string | null
          is_active: boolean
          package_id: string | null
          payment_url: string
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          book_id?: string | null
          callback_token?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          intended_user_id?: string | null
          is_active?: boolean
          package_id?: string | null
          payment_url: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          book_id?: string | null
          callback_token?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          intended_user_id?: string | null
          is_active?: boolean
          package_id?: string | null
          payment_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_payment_links_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_multi_sale: boolean | null
          photos: string[] | null
          preview_url: string
          price: number | null
          price_negotiable: boolean | null
          status: string | null
          tech_stack: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          views: number | null
          zip_path: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_multi_sale?: boolean | null
          photos?: string[] | null
          preview_url: string
          price?: number | null
          price_negotiable?: boolean | null
          status?: string | null
          tech_stack?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          views?: number | null
          zip_path?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_multi_sale?: boolean | null
          photos?: string[] | null
          preview_url?: string
          price?: number | null
          price_negotiable?: boolean | null
          status?: string | null
          tech_stack?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          views?: number | null
          zip_path?: string | null
        }
        Relationships: []
      }
      marketplace_sales: {
        Row: {
          buyer_id: string
          confirmed_at: string | null
          created_at: string
          id: string
          project_id: string
          seller_id: string
          status: string
        }
        Insert: {
          buyer_id: string
          confirmed_at?: string | null
          created_at?: string
          id?: string
          project_id: string
          seller_id: string
          status?: string
        }
        Update: {
          buyer_id?: string
          confirmed_at?: string | null
          created_at?: string
          id?: string
          project_id?: string
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_sales_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "marketplace_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_assignment_submissions: {
        Row: {
          assignment_id: string
          attachment_url: string | null
          attachments: Json
          content: string | null
          course_id: string
          feedback: string | null
          grade: number | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          attachment_url?: string | null
          attachments?: Json
          content?: string | null
          course_id: string
          feedback?: string | null
          grade?: number | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string
          attachment_url?: string | null
          attachments?: Json
          content?: string | null
          course_id?: string
          feedback?: string | null
          grade?: number | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "mentoring_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_assignment_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_assignments: {
        Row: {
          channel_id: string | null
          course_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          min_tier: number
          title: string
          updated_at: string
        }
        Insert: {
          channel_id?: string | null
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          min_tier?: number
          title: string
          updated_at?: string
        }
        Update: {
          channel_id?: string | null
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          min_tier?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_assignments_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "mentoring_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_channel_messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          channel_id: string
          content: string
          course_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          channel_id: string
          content: string
          course_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          channel_id?: string
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_channel_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "mentoring_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_channel_messages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_channels: {
        Row: {
          can_send_min_tier: number
          category: string
          course_id: string
          created_at: string
          id: string
          min_tier: number
          name: string
          sort_order: number
          type: string
        }
        Insert: {
          can_send_min_tier?: number
          category?: string
          course_id: string
          created_at?: string
          id?: string
          min_tier?: number
          name: string
          sort_order?: number
          type?: string
        }
        Update: {
          can_send_min_tier?: number
          category?: string
          course_id?: string
          created_at?: string
          id?: string
          min_tier?: number
          name?: string
          sort_order?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_channels_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_courses: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          duration_hours: number | null
          duration_weeks: number | null
          id: string
          is_active: boolean
          language: string
          mentor_bio: string | null
          mentor_linkedin: string | null
          mentor_name: string
          mentor_photo_url: string | null
          mentor_user_id: string | null
          prerequisites: string | null
          short_description: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean
          language: string
          mentor_bio?: string | null
          mentor_linkedin?: string | null
          mentor_name: string
          mentor_photo_url?: string | null
          mentor_user_id?: string | null
          prerequisites?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          duration_weeks?: number | null
          id?: string
          is_active?: boolean
          language?: string
          mentor_bio?: string | null
          mentor_linkedin?: string | null
          mentor_name?: string
          mentor_photo_url?: string | null
          mentor_user_id?: string | null
          prerequisites?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentoring_dm_messages: {
        Row: {
          content: string
          created_at: string
          dm_id: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          dm_id: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          dm_id?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_dm_messages_dm_id_fkey"
            columns: ["dm_id"]
            isOneToOne: false
            referencedRelation: "mentoring_dms"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_dms: {
        Row: {
          course_id: string
          created_at: string
          id: string
          updated_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_dms_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_faq: {
        Row: {
          answer: string
          course_id: string
          created_at: string
          id: string
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          course_id: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          course_id?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_faq_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_friendships: {
        Row: {
          addressee_id: string
          course_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          course_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          course_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_friendships_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_hub_members: {
        Row: {
          banned: boolean
          course_id: string
          id: string
          joined_at: string
          muted: boolean
          package_tier: number
          role: Database["public"]["Enums"]["mentoring_hub_role"]
          user_id: string
        }
        Insert: {
          banned?: boolean
          course_id: string
          id?: string
          joined_at?: string
          muted?: boolean
          package_tier?: number
          role?: Database["public"]["Enums"]["mentoring_hub_role"]
          user_id: string
        }
        Update: {
          banned?: boolean
          course_id?: string
          id?: string
          joined_at?: string
          muted?: boolean
          package_tier?: number
          role?: Database["public"]["Enums"]["mentoring_hub_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_hub_members_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_lectures: {
        Row: {
          channel_id: string | null
          course_id: string
          created_at: string
          created_by: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          min_tier: number
          recorded_at: string
          recording_url: string | null
          title: string
          views_count: number
        }
        Insert: {
          channel_id?: string | null
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          min_tier?: number
          recorded_at?: string
          recording_url?: string | null
          title: string
          views_count?: number
        }
        Update: {
          channel_id?: string | null
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          min_tier?: number
          recorded_at?: string
          recording_url?: string | null
          title?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_lectures_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "mentoring_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_lectures_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_live_sessions: {
        Row: {
          channel_id: string
          course_id: string
          ended_at: string | null
          host_user_id: string
          id: string
          is_recording: boolean
          started_at: string
          title: string | null
        }
        Insert: {
          channel_id: string
          course_id: string
          ended_at?: string | null
          host_user_id: string
          id?: string
          is_recording?: boolean
          started_at?: string
          title?: string | null
        }
        Update: {
          channel_id?: string
          course_id?: string
          ended_at?: string | null
          host_user_id?: string
          id?: string
          is_recording?: boolean
          started_at?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_live_sessions_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "mentoring_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_live_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_packages: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          features: Json
          id: string
          is_recommended: boolean
          name: string
          price_gel: number
          sort_order: number
          tier: number
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_recommended?: boolean
          name: string
          price_gel?: number
          sort_order?: number
          tier?: number
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_recommended?: boolean
          name?: string
          price_gel?: number
          sort_order?: number
          tier?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_packages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_registrations: {
        Row: {
          amount_gel: number
          course_id: string
          created_at: string
          id: string
          notes: string | null
          package_id: string
          package_tier: number
          payment_provider: string | null
          payment_reference: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_gel: number
          course_id: string
          created_at?: string
          id?: string
          notes?: string | null
          package_id: string
          package_tier?: number
          payment_provider?: string | null
          payment_reference?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_gel?: number
          course_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          package_id?: string
          package_tier?: number
          payment_provider?: string | null
          payment_reference?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_registrations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_registrations_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "mentoring_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_syllabus: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_syllabus_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_voice_sessions: {
        Row: {
          channel_id: string
          course_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          course_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          course_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_voice_sessions_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "mentoring_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_voice_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "mentoring_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      parent_children: {
        Row: {
          child_display_name: string
          child_id: string
          child_username: string
          created_at: string
          id: string
          is_active: boolean
          parent_id: string
        }
        Insert: {
          child_display_name?: string
          child_id: string
          child_username: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_id: string
        }
        Update: {
          child_display_name?: string
          child_id?: string
          child_username?: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_id?: string
        }
        Relationships: []
      }
      password_reset_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          provider: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          provider: string
          setting_key: string
          setting_value?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          paypal_order_id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          paypal_order_id: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          paypal_order_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_config: {
        Row: {
          amount_gel: number
          description: string | null
          key: string
          label: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount_gel?: number
          description?: string | null
          key: string
          label: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount_gel?: number
          description?: string | null
          key?: string
          label?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          email: string
          experience: string | null
          full_name: string | null
          github_url: string | null
          id: string
          location: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          email: string
          experience?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          location?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          email?: string
          experience?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          location?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          book_id: string
          id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          id?: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_attempts: {
        Row: {
          action: string
          attempt_count: number
          blocked_until: string | null
          first_attempt_at: string
          id: string
          identifier: string
          last_attempt_at: string
        }
        Insert: {
          action: string
          attempt_count?: number
          blocked_until?: string | null
          first_attempt_at?: string
          id?: string
          identifier: string
          last_attempt_at?: string
        }
        Update: {
          action?: string
          attempt_count?: number
          blocked_until?: string | null
          first_attempt_at?: string
          id?: string
          identifier?: string
          last_attempt_at?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          book_id: string
          created_at: string
          id: string
          last_page: number | null
          last_read_at: string
          scroll_position: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          last_page?: number | null
          last_read_at?: string
          scroll_position?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          last_page?: number | null
          last_read_at?: string
          scroll_position?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      site_credits_transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          reason: string | null
          ref_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          ref_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          ref_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      site_credits_wallet: {
        Row: {
          balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          topic: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          topic: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          topic?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      update_purchases: {
        Row: {
          id: string
          purchased_at: string
          update_id: string
          user_id: string
        }
        Insert: {
          id?: string
          purchased_at?: string
          update_id: string
          user_id: string
        }
        Update: {
          id?: string
          purchased_at?: string
          update_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_purchases_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "book_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          chapter_id: string
          completed: boolean | null
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          completed?: boolean | null
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "course_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          created_at: string
          credits: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_warnings: {
        Row: {
          created_at: string | null
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          created_at: string
          id: string
          level: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vacancies: {
        Row: {
          category: string | null
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string
          experience_level: string | null
          id: string
          is_active: boolean | null
          job_type: string
          location: string
          package_expires_at: string | null
          package_paid: boolean | null
          package_tier: string | null
          requirements: string | null
          salary_amount: number | null
          salary_currency: string | null
          salary_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description: string
          experience_level?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string
          location: string
          package_expires_at?: string | null
          package_paid?: boolean | null
          package_tier?: string | null
          requirements?: string | null
          salary_amount?: number | null
          salary_currency?: string | null
          salary_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          experience_level?: string | null
          id?: string
          is_active?: boolean | null
          job_type?: string
          location?: string
          package_expires_at?: string | null
          package_paid?: boolean | null
          package_tier?: string | null
          requirements?: string | null
          salary_amount?: number | null
          salary_currency?: string | null
          salary_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vacancy_messages: {
        Row: {
          created_at: string
          cv_url: string | null
          id: string
          is_read: boolean | null
          message: string
          sender_email: string
          sender_id: string
          sender_name: string
          vacancy_id: string
        }
        Insert: {
          created_at?: string
          cv_url?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          sender_email: string
          sender_id: string
          sender_name: string
          vacancy_id: string
        }
        Update: {
          created_at?: string
          cv_url?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          sender_email?: string
          sender_id?: string
          sender_name?: string
          vacancy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacancy_messages_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      video_assignments: {
        Row: {
          course_id: string
          created_at: string | null
          description: string
          id: string
          lecture_id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description: string
          id?: string
          lecture_id: string
          sort_order?: number | null
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string
          id?: string
          lecture_id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "video_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_assignments_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "video_lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      video_course_sections: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          sort_order?: number | null
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "video_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      video_courses: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          price_gel: number | null
          short_description: string | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          price_gel?: number | null
          short_description?: string | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          price_gel?: number | null
          short_description?: string | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      video_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string | null
          expires_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "video_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      video_lectures: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          is_free_preview: boolean | null
          section_id: string
          sort_order: number | null
          title: string
          video_storage_path: string | null
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_free_preview?: boolean | null
          section_id: string
          sort_order?: number | null
          title: string
          video_storage_path?: string | null
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_free_preview?: boolean | null
          section_id?: string
          sort_order?: number | null
          title?: string
          video_storage_path?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_lectures_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "video_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_lectures_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "video_course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      video_progress: {
        Row: {
          completed: boolean | null
          course_id: string
          id: string
          lecture_id: string
          position_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          course_id: string
          id?: string
          lecture_id: string
          position_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          course_id?: string
          id?: string
          lecture_id?: string
          position_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "video_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "video_lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_transactions: {
        Row: {
          action_type: string
          amount: number
          created_at: string
          id: string
          reference_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          amount: number
          created_at?: string
          id?: string
          reference_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          amount?: number
          created_at?: string
          id?: string
          reference_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      manual_payment_links_public: {
        Row: {
          amount: number | null
          book_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          package_id: string | null
          payment_url: string | null
          title: string | null
        }
        Insert: {
          amount?: number | null
          book_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          package_id?: string | null
          payment_url?: string | null
          title?: string | null
        }
        Update: {
          amount?: number | null
          book_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          package_id?: string | null
          payment_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manual_payment_links_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_friend_request: {
        Args: { _friendship_id: string }
        Returns: boolean
      }
      add_user_credits: {
        Args: { _amount: number; _user_id: string }
        Returns: boolean
      }
      admin_award_xp: {
        Args: { _amount: number; _reason?: string; _user_id: string }
        Returns: undefined
      }
      admin_grant_site_credits: {
        Args: {
          _amount: number
          _reason: string
          _type?: string
          _user_id: string
        }
        Returns: number
      }
      answer_call: { Args: { _call_id: string }; Returns: boolean }
      award_xp: {
        Args: {
          _action: string
          _amount: number
          _ref?: string
          _user_id: string
        }
        Returns: undefined
      }
      block_user: { Args: { _target_user_id: string }; Returns: string }
      can_access_mentoring_hub: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      confirm_marketplace_sale: {
        Args: { sale_id: string }
        Returns: undefined
      }
      cyberrange_has_access: {
        Args: { _challenge_id: string; _user_id: string }
        Returns: boolean
      }
      cyberrange_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          rank_slug: string
          solves_count: number
          total_points: number
          user_id: string
        }[]
      }
      cyberrange_rank_for_points: { Args: { _points: number }; Returns: string }
      decline_friend_request: {
        Args: { _friendship_id: string }
        Returns: boolean
      }
      deduct_user_credits: {
        Args: { _amount: number; _user_id: string }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      end_call: { Args: { _call_id: string }; Returns: boolean }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      find_user_by_email: {
        Args: { search_email: string }
        Returns: {
          email: string
          full_name: string
          user_id: string
        }[]
      }
      get_assignment_submission_stats: {
        Args: { _assignment_id: string }
        Returns: {
          submitted: number
          total: number
        }[]
      }
      get_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          level: number
          total_xp: number
          user_id: string
        }[]
      }
      get_pending_requests: {
        Args: { _user_id: string }
        Returns: {
          created_at: string
          friendship_id: string
          requester_id: string
        }[]
      }
      get_sent_requests: {
        Args: { _user_id: string }
        Returns: {
          created_at: string
          friendship_id: string
          target_user_id: string
        }[]
      }
      get_user_friends: {
        Args: { _user_id: string }
        Returns: {
          created_at: string
          friend_id: string
          status: Database["public"]["Enums"]["friendship_status"]
        }[]
      }
      has_paid_mentoring: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_blog_views: { Args: { _post_id: string }; Returns: undefined }
      increment_forum_views: { Args: { _post_id: string }; Returns: undefined }
      increment_lecture_view: {
        Args: { _lecture_id: string }
        Returns: undefined
      }
      increment_project_views: {
        Args: { project_id: string }
        Returns: undefined
      }
      increment_promo_usage: { Args: { _code: string }; Returns: undefined }
      initiate_call: {
        Args: {
          _call_type?: Database["public"]["Enums"]["call_type"]
          _conversation_id: string
          _receiver_id: string
        }
        Returns: string
      }
      is_course_mentor: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      is_mentoring_hub_member: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      reconcile_transaction_credits: {
        Args: { _txn_id: string }
        Returns: Json
      }
      reject_call: { Args: { _call_id: string }; Returns: boolean }
      remove_friend: { Args: { _friendship_id: string }; Returns: boolean }
      send_friend_request: {
        Args: { _target_user_id: string }
        Returns: string
      }
      set_vacancy_package_tier: {
        Args: { p_tier: string; p_vacancy_id: string }
        Returns: undefined
      }
      spend_site_credits: {
        Args: {
          _amount: number
          _reason: string
          _ref_id?: string
          _user_id: string
        }
        Returns: boolean
      }
      validate_promo_code: {
        Args: { _code: string }
        Returns: {
          code: string
          discount_type: string
          discount_value: number
        }[]
      }
      voice_message_path: {
        Args: { _message_id: string; _user_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user" | "child" | "mentor"
      call_status:
        | "initiated"
        | "ringing"
        | "connected"
        | "ended"
        | "rejected"
        | "missed"
      call_type: "audio" | "video"
      friendship_status: "pending" | "accepted" | "declined" | "blocked"
      mentoring_hub_role:
        | "mentor"
        | "mentor_assistant"
        | "top_student"
        | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "child", "mentor"],
      call_status: [
        "initiated",
        "ringing",
        "connected",
        "ended",
        "rejected",
        "missed",
      ],
      call_type: ["audio", "video"],
      friendship_status: ["pending", "accepted", "declined", "blocked"],
      mentoring_hub_role: [
        "mentor",
        "mentor_assistant",
        "top_student",
        "student",
      ],
    },
  },
} as const
