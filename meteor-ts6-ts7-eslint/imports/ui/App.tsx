import { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { documentIdentity } from './documentIdentity';

type ServerStatus = { pid: number; boot: string; revision: string; release: string };

export const App = () => {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  useEffect(() => {
    const refresh = () => {
      void (Meteor.callAsync('demo.status') as Promise<ServerStatus>).then(setStatus);
    };
    refresh();
    const timer = setInterval(refresh, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <main className="demo">
      <p>Meteor · Rspack · TypeScript 6 + 7</p>
      <h1>Coexistência TS6 / TS7</h1>
      <p id="hmr-label">Componente: revisão A</p>
      <button id="counter" onClick={() => setCount(value => value + 1)}>Contador HMR: {count}</button>
      <p id="document-id">Documento: {documentIdentity}</p>
      <p id="server-status">Servidor: {status ? `${status.revision} · PID ${status.pid} · boot ${status.boot}` : 'conectando'}</p>
      <p>Release: {status?.release}</p>
      <p>ESLint usa a API de TS6. Typecheck usa TS7 pelo alias @typescript/native.</p>
      <p>Edite este componente ou client/main.css e confira o contador. Edite server/main.ts e confira o PID.</p>
    </main>
  );
};
