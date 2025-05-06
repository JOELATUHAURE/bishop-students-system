import { supabase } from '../lib/supabase';

const api = {
  auth: {
    signUp: async (data: { email: string; password: string; name?: string }) => {
      const { data: user, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name }
        }
      });
      if (error) throw error;
      return user;
    },

    signIn: async (data: { email: string; password: string }) => {
      const { data: session, error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
      localStorage.setItem('auth_token', session.session.access_token);
      localStorage.setItem('auth_user', JSON.stringify(session.user));
      return session;
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },

    getUser: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    }
  },

  applications: {
    list: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    get: async (id: string | number) => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, education_records(*), documents(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (data: any) => {
      const { data: newApplication, error } = await supabase
        .from('applications')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return newApplication;
    },

    update: async (id: string | number, data: any) => {
      const { data: updated, error } = await supabase
        .from('applications')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    delete: async (id: string | number) => {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  documents: {
    upload: async (applicationId: string, file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${applicationId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const { data: document, error } = await supabase
        .from('documents')
        .insert({
          application_id: applicationId,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type
        })
        .select()
        .single();
      if (error) throw error;

      return { ...document, url: publicUrl };
    }
  }
};

export default api;
