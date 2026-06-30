import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (conteo, error) => {
        if (axios.isAxiosError(error) && error.response) {
          const estado = error.response.status;
          if (estado >= 400 && estado < 500) {
            return false;
          }
        }
        return conteo < 2;
      },
      retryDelay: (intento) => Math.min(1000 * 2 ** intento, 8000),
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});
