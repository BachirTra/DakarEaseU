export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          coliving_room_id: string | null;
          created_at: string;
          duration_months: number;
          id: string;
          listing_id: string;
          payment_method: Database['public']['Enums']['payment_method'] | null;
          payment_status: Database['public']['Enums']['payment_status'];
          start_date: string;
          status: Database['public']['Enums']['booking_status'];
          total_amount: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          coliving_room_id?: string | null;
          created_at?: string;
          duration_months: number;
          id?: string;
          listing_id: string;
          payment_method?: Database['public']['Enums']['payment_method'] | null;
          payment_status?: Database['public']['Enums']['payment_status'];
          start_date: string;
          status?: Database['public']['Enums']['booking_status'];
          total_amount: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          coliving_room_id?: string | null;
          created_at?: string;
          duration_months?: number;
          id?: string;
          listing_id?: string;
          payment_method?: Database['public']['Enums']['payment_method'] | null;
          payment_status?: Database['public']['Enums']['payment_status'];
          start_date?: string;
          status?: Database['public']['Enums']['booking_status'];
          total_amount?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_coliving_room_id_fkey';
            columns: ['coliving_room_id'];
            isOneToOne: false;
            referencedRelation: 'listing_coliving_rooms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      event_rsvps: {
        Row: {
          checked_in_at: string | null;
          created_at: string;
          event_id: string;
          id: string;
          qr_code: string | null;
          status: Database['public']['Enums']['rsvp_status'];
          user_id: string;
        };
        Insert: {
          checked_in_at?: string | null;
          created_at?: string;
          event_id: string;
          id?: string;
          qr_code?: string | null;
          status?: Database['public']['Enums']['rsvp_status'];
          user_id: string;
        };
        Update: {
          checked_in_at?: string | null;
          created_at?: string;
          event_id?: string;
          id?: string;
          qr_code?: string | null;
          status?: Database['public']['Enums']['rsvp_status'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_rsvps_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_rsvps_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      events: {
        Row: {
          category: Database['public']['Enums']['event_category'];
          cover_image_url: string | null;
          created_at: string;
          description: string | null;
          event_date: string;
          event_time: string | null;
          id: string;
          is_featured: boolean;
          partner: string | null;
          price_label: string | null;
          price_value: number;
          title: string;
          updated_at: string;
          venue: string | null;
        };
        Insert: {
          category: Database['public']['Enums']['event_category'];
          cover_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          event_date: string;
          event_time?: string | null;
          id?: string;
          is_featured?: boolean;
          partner?: string | null;
          price_label?: string | null;
          price_value?: number;
          title: string;
          updated_at?: string;
          venue?: string | null;
        };
        Update: {
          category?: Database['public']['Enums']['event_category'];
          cover_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          event_date?: string;
          event_time?: string | null;
          id?: string;
          is_featured?: boolean;
          partner?: string | null;
          price_label?: string | null;
          price_value?: number;
          title?: string;
          updated_at?: string;
          venue?: string | null;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          created_at: string;
          entity_id: string;
          entity_type: Database['public']['Enums']['favorite_entity_type'];
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          entity_id: string;
          entity_type: Database['public']['Enums']['favorite_entity_type'];
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          entity_id?: string;
          entity_type?: Database['public']['Enums']['favorite_entity_type'];
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      guided_search_requests: {
        Row: {
          budget: number;
          coloc_pref: string;
          created_at: string;
          district: string | null;
          duration_months: number;
          furnished_pref: string;
          housing_type: string;
          id: string;
          school_id: string | null;
          status: Database['public']['Enums']['guided_search_status'];
          user_id: string;
        };
        Insert: {
          budget: number;
          coloc_pref?: string;
          created_at?: string;
          district?: string | null;
          duration_months?: number;
          furnished_pref?: string;
          housing_type?: string;
          id?: string;
          school_id?: string | null;
          status?: Database['public']['Enums']['guided_search_status'];
          user_id: string;
        };
        Update: {
          budget?: number;
          coloc_pref?: string;
          created_at?: string;
          district?: string | null;
          duration_months?: number;
          furnished_pref?: string;
          housing_type?: string;
          id?: string;
          school_id?: string | null;
          status?: Database['public']['Enums']['guided_search_status'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'guided_search_requests_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'guided_search_requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      listing_coliving_rooms: {
        Row: {
          created_at: string;
          id: string;
          is_available: boolean;
          label: string;
          listing_id: string;
          price: number;
          surface_m2: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_available?: boolean;
          label: string;
          listing_id: string;
          price: number;
          surface_m2?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_available?: boolean;
          label?: string;
          listing_id?: string;
          price?: number;
          surface_m2?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_coliving_rooms_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listing_media: {
        Row: {
          created_at: string;
          id: string;
          listing_id: string;
          media_type: Database['public']['Enums']['media_type'];
          position: number;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          listing_id: string;
          media_type: Database['public']['Enums']['media_type'];
          position?: number;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          listing_id?: string;
          media_type?: Database['public']['Enums']['media_type'];
          position?: number;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_media_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listings: {
        Row: {
          amenities: string[];
          bathrooms: number | null;
          bedrooms: number | null;
          colocation_available: boolean;
          created_at: string;
          created_by: string | null;
          currency: string;
          description: string | null;
          distance_label: string | null;
          district: string;
          furnished: boolean;
          id: string;
          min_duration_months: number;
          particularities: string[];
          period: string;
          price: number;
          rating: number | null;
          requirements: string[];
          reviews_count: number;
          surface_m2: number | null;
          title: string;
          type: Database['public']['Enums']['listing_type'];
          updated_at: string;
          verification_status: Database['public']['Enums']['listing_verification_status'];
        };
        Insert: {
          amenities?: string[];
          bathrooms?: number | null;
          bedrooms?: number | null;
          colocation_available?: boolean;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          description?: string | null;
          distance_label?: string | null;
          district: string;
          furnished?: boolean;
          id?: string;
          min_duration_months?: number;
          particularities?: string[];
          period?: string;
          price: number;
          rating?: number | null;
          requirements?: string[];
          reviews_count?: number;
          surface_m2?: number | null;
          title: string;
          type: Database['public']['Enums']['listing_type'];
          updated_at?: string;
          verification_status?: Database['public']['Enums']['listing_verification_status'];
        };
        Update: {
          amenities?: string[];
          bathrooms?: number | null;
          bedrooms?: number | null;
          colocation_available?: boolean;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          description?: string | null;
          distance_label?: string | null;
          district?: string;
          furnished?: boolean;
          id?: string;
          min_duration_months?: number;
          particularities?: string[];
          period?: string;
          price?: number;
          rating?: number | null;
          requirements?: string[];
          reviews_count?: number;
          surface_m2?: number | null;
          title?: string;
          type?: Database['public']['Enums']['listing_type'];
          updated_at?: string;
          verification_status?: Database['public']['Enums']['listing_verification_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'listings_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          is_read: boolean;
          reference_id: string | null;
          reference_type: string | null;
          title: string;
          type: Database['public']['Enums']['notification_type'];
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          reference_id?: string | null;
          reference_type?: string | null;
          title: string;
          type: Database['public']['Enums']['notification_type'];
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          reference_id?: string | null;
          reference_type?: string | null;
          title?: string;
          type?: Database['public']['Enums']['notification_type'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          is_blocked: boolean;
          language: string;
          persona: Database['public']['Enums']['persona_type'] | null;
          phone: string | null;
          role: Database['public']['Enums']['user_role'];
          school_id: string | null;
          updated_at: string;
          verification_doc_url: string | null;
          verification_status: Database['public']['Enums']['verification_status'];
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          is_blocked?: boolean;
          language?: string;
          persona?: Database['public']['Enums']['persona_type'] | null;
          phone?: string | null;
          role?: Database['public']['Enums']['user_role'];
          school_id?: string | null;
          updated_at?: string;
          verification_doc_url?: string | null;
          verification_status?: Database['public']['Enums']['verification_status'];
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          is_blocked?: boolean;
          language?: string;
          persona?: Database['public']['Enums']['persona_type'] | null;
          phone?: string | null;
          role?: Database['public']['Enums']['user_role'];
          school_id?: string | null;
          updated_at?: string;
          verification_doc_url?: string | null;
          verification_status?: Database['public']['Enums']['verification_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
        ];
      };
      restaurant_media: {
        Row: {
          created_at: string;
          id: string;
          position: number;
          restaurant_id: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          position?: number;
          restaurant_id: string;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          position?: number;
          restaurant_id?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'restaurant_media_restaurant_id_fkey';
            columns: ['restaurant_id'];
            isOneToOne: false;
            referencedRelation: 'restaurants';
            referencedColumns: ['id'];
          },
        ];
      };
      restaurants: {
        Row: {
          created_at: string;
          cuisine_type: string;
          description: string | null;
          distance_label: string | null;
          district: string;
          has_delivery: boolean;
          id: string;
          name: string;
          opening_hours: string | null;
          phone: string | null;
          price_range: string | null;
          rating: number | null;
          reviews_count: number;
          specialties: string[];
          updated_at: string;
          whatsapp: string | null;
        };
        Insert: {
          created_at?: string;
          cuisine_type: string;
          description?: string | null;
          distance_label?: string | null;
          district: string;
          has_delivery?: boolean;
          id?: string;
          name: string;
          opening_hours?: string | null;
          phone?: string | null;
          price_range?: string | null;
          rating?: number | null;
          reviews_count?: number;
          specialties?: string[];
          updated_at?: string;
          whatsapp?: string | null;
        };
        Update: {
          created_at?: string;
          cuisine_type?: string;
          description?: string | null;
          distance_label?: string | null;
          district?: string;
          has_delivery?: boolean;
          id?: string;
          name?: string;
          opening_hours?: string | null;
          phone?: string | null;
          price_range?: string | null;
          rating?: number | null;
          reviews_count?: number;
          specialties?: string[];
          updated_at?: string;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          author_id: string;
          comment: string | null;
          created_at: string;
          id: string;
          rating: number;
          target_id: string;
          target_type: Database['public']['Enums']['review_target_type'];
        };
        Insert: {
          author_id: string;
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating: number;
          target_id: string;
          target_type: Database['public']['Enums']['review_target_type'];
        };
        Update: {
          author_id?: string;
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating?: number;
          target_id?: string;
          target_type?: Database['public']['Enums']['review_target_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      school_nearby_listings: {
        Row: {
          listing_id: string;
          school_id: string;
        };
        Insert: {
          listing_id: string;
          school_id: string;
        };
        Update: {
          listing_id?: string;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'school_nearby_listings_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'school_nearby_listings_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
        ];
      };
      schools: {
        Row: {
          address: string | null;
          admission_steps: string[];
          cover_image_url: string | null;
          created_at: string;
          district: string;
          email: string | null;
          fees_text: string | null;
          founded_year: number | null;
          full_name: string | null;
          id: string;
          name: string;
          phone: string | null;
          programs: string[];
          scholarships: string[];
          students_count: number | null;
          updated_at: string;
          website: string | null;
          whatsapp: string | null;
        };
        Insert: {
          address?: string | null;
          admission_steps?: string[];
          cover_image_url?: string | null;
          created_at?: string;
          district: string;
          email?: string | null;
          fees_text?: string | null;
          founded_year?: number | null;
          full_name?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          programs?: string[];
          scholarships?: string[];
          students_count?: number | null;
          updated_at?: string;
          website?: string | null;
          whatsapp?: string | null;
        };
        Update: {
          address?: string | null;
          admission_steps?: string[];
          cover_image_url?: string | null;
          created_at?: string;
          district?: string;
          email?: string | null;
          fees_text?: string | null;
          founded_year?: number | null;
          full_name?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          programs?: string[];
          scholarships?: string[];
          students_count?: number | null;
          updated_at?: string;
          website?: string | null;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      transport_providers: {
        Row: {
          category: Database['public']['Enums']['transport_category'];
          created_at: string;
          eta_label: string | null;
          id: string;
          name: string;
          phone: string | null;
          price_label: string | null;
          rating: number | null;
          updated_at: string;
          whatsapp: string | null;
        };
        Insert: {
          category: Database['public']['Enums']['transport_category'];
          created_at?: string;
          eta_label?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          price_label?: string | null;
          rating?: number | null;
          updated_at?: string;
          whatsapp?: string | null;
        };
        Update: {
          category?: Database['public']['Enums']['transport_category'];
          created_at?: string;
          eta_label?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          price_label?: string | null;
          rating?: number | null;
          updated_at?: string;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
      match_listings: {
        Args: {
          p_budget?: number;
          p_coloc?: string;
          p_district?: string;
          p_furnished?: string;
          p_months?: number;
          p_school_id?: string;
          p_type?: string;
        };
        Returns: Database['public']['CompositeTypes']['match_result'][];
        SetofOptions: {
          from: '*';
          to: 'match_result';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
    };
    Enums: {
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      event_category: 'concert' | 'festival' | 'conference' | 'sport';
      favorite_entity_type: 'listing' | 'restaurant';
      guided_search_status: 'open' | 'matched' | 'closed';
      listing_type: 'studio' | 'chambre' | 'appartement' | 'maison';
      listing_verification_status: 'pending' | 'published' | 'rejected';
      media_type: 'photo' | 'video' | 'tour_3d';
      notification_type:
        | 'booking_status_update'
        | 'event_rsvp_confirmed'
        | 'new_guided_search_request'
        | 'verification_status_update';
      payment_method: 'wave' | 'orange_money' | 'card';
      payment_status: 'pending' | 'success' | 'failed';
      persona_type: 'nouveau' | 'local' | 'parent';
      review_target_type: 'listing' | 'restaurant' | 'stay';
      rsvp_status: 'interested' | 'confirmed';
      transport_category: 'taxi' | 'moto' | 'repas' | 'colis' | 'demenagement' | 'location';
      user_role: 'student' | 'admin';
      verification_status: 'pending' | 'approved' | 'rejected';
    };
    CompositeTypes: {
      match_result: {
        listing_id: string | null;
        match_pct: number | null;
        reasons: string[] | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      booking_status: ['pending', 'confirmed', 'cancelled', 'completed'],
      event_category: ['concert', 'festival', 'conference', 'sport'],
      favorite_entity_type: ['listing', 'restaurant'],
      guided_search_status: ['open', 'matched', 'closed'],
      listing_type: ['studio', 'chambre', 'appartement', 'maison'],
      listing_verification_status: ['pending', 'published', 'rejected'],
      media_type: ['photo', 'video', 'tour_3d'],
      notification_type: [
        'booking_status_update',
        'event_rsvp_confirmed',
        'new_guided_search_request',
        'verification_status_update',
      ],
      payment_method: ['wave', 'orange_money', 'card'],
      payment_status: ['pending', 'success', 'failed'],
      persona_type: ['nouveau', 'local', 'parent'],
      review_target_type: ['listing', 'restaurant', 'stay'],
      rsvp_status: ['interested', 'confirmed'],
      transport_category: ['taxi', 'moto', 'repas', 'colis', 'demenagement', 'location'],
      user_role: ['student', 'admin'],
      verification_status: ['pending', 'approved', 'rejected'],
    },
  },
} as const;
