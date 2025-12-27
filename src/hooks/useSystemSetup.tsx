import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSystemSetup = () => {
  return useQuery({
    queryKey: ['system_setup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('is_setup_completed')
        .maybeSingle();
      
      if (error) throw error;
      
      // If no settings exist, system is not setup
      if (!data) {
        return { isSetupCompleted: false };
      }
      
      return { isSetupCompleted: data.is_setup_completed ?? false };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export default useSystemSetup;
