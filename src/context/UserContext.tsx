'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, User } from '@supabase/supabase-js';

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
  roles: string;
  criado_em: string;
  atualizado_em: string;
}

interface UserContextType {
  user: User | null;
  perfil: UserPerfil | null;
  loading: boolean;
  refetchPerfil: () => Promise<void>;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  const fetchPerfil = async (userId: string) => {
    try {
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis')
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
      setLoading(true);
      const perfilData = await fetchPerfil(user.id);
      setPerfil(perfilData);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        const perfilData = await fetchPerfil(session.user.id);
        setPerfil(perfilData);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const perfilData = await fetchPerfil(session.user.id);
          setPerfil(perfilData);
        } else {
          setUser(null);
          setPerfil(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, perfil, loading, refetchPerfil }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
