import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/core/auth/session';
import { conectarSocket, desconectarSocket } from './socket';

export function useSocketTiempoReal(): null {
  const autenticado = useSession((s) => s.autenticado);
  const ruc = useSession((s) => s.usuario?.ruc);
  const email = useSession((s) => s.usuario?.email);
  const cliente = useQueryClient();

  useEffect(() => {
    if (!autenticado || !ruc) {
      return;
    }
    const socket = conectarSocket(ruc, email ?? '');
    const refrescarSalon = () => {
      void cliente.invalidateQueries({ queryKey: ['salon'] });
    };

    socket.on('set-open-table', refrescarSalon);
    socket.on('set-reset-table', refrescarSalon);
    socket.on('table-updated', refrescarSalon);
    socket.on('reset-table-envs', refrescarSalon);

    return () => {
      socket.off('set-open-table', refrescarSalon);
      socket.off('set-reset-table', refrescarSalon);
      socket.off('table-updated', refrescarSalon);
      socket.off('reset-table-envs', refrescarSalon);
      desconectarSocket();
    };
  }, [autenticado, ruc, email, cliente]);

  return null;
}
