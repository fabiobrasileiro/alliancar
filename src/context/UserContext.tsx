'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, User } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {

    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();

            if (data.user) {
                setUser(data.user);

                const { data: profileData } = await supabase
                    .from('profile')
                    .select('*')
                    .eq('auth_id', data.user.id)
                    .single();

                setProfile(profileData);
            }

            setLoading(false); // ✅ indica que terminou
        };

        fetchUser();

        // atualizar automaticamente quando o estado de auth mudar
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                // opcional: buscar profile de novo
            } else {
                setUser(null);
                setProfile(null);
            }
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);
    console.log('user aqui:', user)

    return (
        <UserContext.Provider value={{ user, profile, loading, setLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);