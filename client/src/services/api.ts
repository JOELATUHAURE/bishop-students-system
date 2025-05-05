import { supabase } from '../lib/supabase';

// Create API service with Supabase
const api = {
  auth: {
    signUp: async (data: { email: string; password: string; }) => {
      const { data: user, error } = await supabase.auth.signUp(data);
      if (error) throw error;
      return user;
    },
    signIn: async (data: { email: string; password: string; }) => {
      const { data: session, error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
      return session;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    getUser: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    }
  },
  applications: {
    create: async (data: any) => {
      const { data: application, error } = await supabase
        .from('applications')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return application;
    },
    update: async (id: string, data: any) => {
      const { data: application, error } = await supabase
        .from('applications')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return application;
    },
    get: async (id: string) => {
      const { data: application, error } = await supabase
        .from('applications')
        .select('*, education_records(*), documents(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return application;
    },
    list: async () => {
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return applications;
    },
    delete: async (id: string) => {
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
      const fileName = `${Math.random()}.${fileExt}`;
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