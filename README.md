# ChessCraft

ChessCraft é uma aplicação de xadrez construída com React, TypeScript e Vite. Ela reúne partidas locais, bots, puzzles, partidas online por sala, perfil com rating e preferências de acessibilidade.

## Recursos

- Partida local para duas pessoas no mesmo dispositivo.
- Bots com força compatível com o Elo exibido, de 150 a 1300.
- Puzzles táticos com dicas, sequência e estatísticas.
- Salas online em tempo real usando Firebase Realtime Database.
- Tela de fim de jogo para partidas contra bot e online, incluindo rating e histórico.
- Pontuação diferenciada: vitória online concede mais pontos do que vitória contra a IA.
- Tema claro ou escuro, contraste, redução de movimento, sons e música gerada no próprio navegador.
- Área “Em breve” para os próximos recursos. Torneios não fazem parte da versão atual.

## Requisitos

- Node.js 18 ou superior
- npm

## Como executar

```bash
git clone <url-do-repositorio>
cd ChessCraft
npm install
npm run dev
```

O servidor de desenvolvimento abre em `http://localhost:5173`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test:run
npm run preview
```

## Estrutura

```text
src/
  components/       componentes compartilhados
  features/         dashboard, jogo, multiplayer e puzzles
  hooks/            estado e regras das partidas
  service/          Firebase, perfil, cache e puzzles
  types/            tipos TypeScript
  utils/            IA, áudio e logs
```

## Rating e bots

O jogador começa com rating 150. Contra a IA, uma vitória vale +15 pontos; em uma partida online, vale +25 pontos. Empates valem +3 e +6, respectivamente.

Os Elos dos bots representam a força disponível no motor desta aplicação:

| Bot | Elo | Dificuldade |
| --- | ---: | --- |
| Gloop | 150 | Iniciante |
| Gargoyle | 300 | Fácil |
| Sir Gareth | 550 | Médio |
| Archmage Ignis | 800 | Difícil |
| Vespera | 1050 | Mestre |
| CHESS-MIND 9000 | 1300 | Hardcore |

## Firebase

A configuração do cliente está em `src/service/firebase.ts`. Antes de publicar regras novas, consulte [firebase-rules-audit.md](firebase-rules-audit.md). O projeto atual ainda usa o nome normalizado do jogador como chave de perfil e não vincula essa chave ao UID do Firebase Authentication; por isso, regras restritivas por usuário exigem essa migração antes de serem aplicadas.

Os dados usados pelo aplicativo são:

- `users/{userId}`: perfil, rating e histórico.
- `rooms/{roomId}`: estado efêmero de partidas online.

## Tecnologias

- React 19
- TypeScript
- Vite
- chess.js
- react-chessboard
- Firebase Realtime Database
- Vitest
