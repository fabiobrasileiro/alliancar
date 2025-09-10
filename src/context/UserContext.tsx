'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client'; // Use o client já configurado

interface UserPerfil {
  id: string;
  auth_id: string;
  nome_completo: string;
  cpf_cnpj: string;
  telefone: string;
  foto_perfil_url: string;
  receita_estimada: number;
  ativo: boolean;
  tipo_usuario: string;
  tipo: string;
  criado_em: string;
  atualizado_em: string;
}

interface UserContextType {
  user: User | null;
  perfil: UserPerfil | null;
  loading: boolean;
  refetchPerfil: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  perfil: null,
  loading: true,
  refetchPerfil: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<UserPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient(); // Use o client já configurado

  const fetchPerfil = async (userId: string) => {
    try {
      const { data: perfilData, error: perfilError } = await supabase
        .from('afiliados')
        .select('*')
        .eq('auth_id', userId)
        .maybeSingle();

      if (perfilError) {
        console.error("Erro ao buscar perfil:", perfilError);
        return null;
      }
      
      return perfilData;
    } catch (error) {
      console.error("Erro na busca do perfil:", error);
      return null;
    }
  };

  const refetchPerfil = async () => {
    if (user?.id) {
      const perfilData = await fetchPerfil(user.id);
      setPerfil(perfilData);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Obter sessão inicial
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError);
          return;
        }

        if (mounted && session?.user) {
          setUser(session.user);
          const perfilData = await fetchPerfil(session.user.id);
          if (mounted) {
            setPerfil(perfilData);
          }
        }
      } catch (error) {
        console.error("Erro na inicialização do auth:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const perfilData = await fetchPerfil(session.user.id);
          setPerfil(perfilData);
        } else {
          setUser(null);
          setPerfil(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <UserContext.Provider value={{ user, perfil, loading, refetchPerfil }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};