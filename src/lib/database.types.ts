type Table<
  Row extends Record<string, unknown>,
  Insert extends Record<string, unknown>,
  Update extends Record<string, unknown>,
  Relationships extends {
    foreignKeyName: string;
    columns: string[];
    isOneToOne: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }[] = []
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          full_name: string;
          role: 'admin' | 'librarian';
          active: boolean;
          created_at: string;
        },
        {
          id: string;
          full_name?: string;
          role: 'admin' | 'librarian';
          active?: boolean;
          created_at?: string;
        },
        {
          id?: string;
          full_name?: string;
          role?: 'admin' | 'librarian';
          active?: boolean;
          created_at?: string;
        }
      >;
      books: Table<
        {
          id: string;
          title: string;
          author: string;
          isbn: string | null;
          category: string | null;
          total_copies: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          title: string;
          author: string;
          isbn?: string | null;
          category?: string | null;
          total_copies?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          title?: string;
          author?: string;
          isbn?: string | null;
          category?: string | null;
          total_copies?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      borrowers: Table<
        {
          id: string;
          full_name: string;
          student_id: string | null;
          email: string | null;
          phone: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          full_name: string;
          student_id?: string | null;
          email?: string | null;
          phone?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          full_name?: string;
          student_id?: string | null;
          email?: string | null;
          phone?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      borrowings: Table<
        {
          id: string;
          book_id: string;
          borrower_id: string;
          borrowed_at: string;
          due_date: string;
          returned_at: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        },
        {
          id?: string;
          book_id: string;
          borrower_id: string;
          borrowed_at?: string;
          due_date: string;
          returned_at?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          book_id?: string;
          borrower_id?: string;
          borrowed_at?: string;
          due_date?: string;
          returned_at?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        },
        [
          {
            foreignKeyName: 'borrowings_book_id_fkey';
            columns: ['book_id'];
            isOneToOne: false;
            referencedRelation: 'books';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'borrowings_borrower_id_fkey';
            columns: ['borrower_id'];
            isOneToOne: false;
            referencedRelation: 'borrowers';
            referencedColumns: ['id'];
          }
        ]
      >;
    };
    Views: Record<string, never>;
    Functions: {
      issue_book: {
        Args: {
          p_book_id: string;
          p_borrower_id: string;
          p_borrowed_at?: string;
          p_due_date?: string;
          p_notes?: string | null;
        };
        Returns: string;
      };
      return_book: {
        Args: { p_borrowing_id: string };
        Returns: undefined;
      };
      is_library_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};