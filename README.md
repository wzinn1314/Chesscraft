# ChessCraft

Uma aplicação de xadrez moderna desenvolvida com React, TypeScript e Vite, featuring IA avançada, puzzles táticos, jogo online e sistema de perfis.

## 🎯 Funcionalidades

### Modos de Jogo
- **🎮 Passa e Joga**: Jogue localmente com um amigo no mesmo dispositivo
- **🤖 Contra Computador**: Enfrente uma IA com diferentes níveis de dificuldade
- **🌐 Jogar Online**: Partidas multiplayer em tempo real via Firebase
- **🧩 Puzzles Táticos**: Resolva problemas de xadrez para melhorar sua visão tática

### Sistema de IA
- **Algoritmo Minimax com Alpha-Beta Pruning**: Busca otimizada para melhores movimentos
- **Tabelas de Avaliação Posicional**: Avaliação sofisticada de posições para cada peça
- **4 Níveis de Dificuldade**: Easy, Medium, Hard e Expert
- **Avaliação de Mobilidade e Final de Jogo**: Estratégias adaptativas para diferentes fases da partida

### Sistema de Puzzles
- **8 Puzzles de Exemplo**: Problemas táticos reais de diferentes dificuldades
- **Sistema de Dificuldade**: Fácil, Médio e Difícil
- **Estatísticas Detalhadas**: Sequência atual, melhor sequência, tempo médio, taxa de sucesso
- **Sistema de Dicas**: Ajuda interativa quando você está preso
- **Validação de Movimentos**: Verificação em tempo real da solução

### Design System
- **Componentes Reutilizáveis**: Button, Card, Badge com variantes consistentes
- **Tema Visual Coerente**: Sistema de cores, espaçamentos e tipografia unificado
- **Responsividade**: Interface adaptada para desktop e mobile
- **Animações Suaves**: Transições e feedback visual aprimorado

## 🚀 Getting Started

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd ChessCraft

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Linting
npm run lint

# Testes
npm run test              # Executa testes em modo watch
npm run test:run         # Executa testes uma vez
npm run test:ui          # Interface visual de testes
```

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios

```
ChessCraft/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Button.tsx       # Botão com variantes
│   │   ├── Card.tsx         # Card com estilos
│   │   ├── Badge.tsx        # Badge para tags
│   │   ├── ChessBoardView.tsx # Visualização do tabuleiro
│   │   ├── Header.tsx       # Cabeçal da aplicação
│   │   ├── Sidebar.tsx      # Barra lateral de navegação
│   │   └── ...
│   ├── features/            # Funcionalidades principais
│   │   ├── dashboard/       # Dashboard e estatísticas
│   │   ├── game/           # Arenas de jogo (local, IA)
│   │   ├── multiplayer/    # Sistema online
│   │   └── puzzles/        # Sistema de puzzles
│   ├── hooks/              # Hooks personalizados
│   │   ├── useChessGame.ts  # Lógica do jogo de xadrez
│   │   ├── useMoveHints.ts # Hints de movimento
│   │   ├── usePuzzle.ts    # Lógica de puzzles
│   │   └── useOnlineGame.ts # Lógica multiplayer
│   ├── service/            # Serviços e APIs
│   │   ├── userService.ts  # Gerenciamento de usuários
│   │   ├── puzzleService.ts # Serviço de puzzles
│   │   ├── cache.ts        # Cache local
│   │   └── firebase.ts     # Configuração Firebase
│   ├── types/              # Definições TypeScript
│   │   ├── chess.ts        # Tipos de xadrez
│   │   ├── puzzle.ts       # Tipos de puzzles
│   │   └── user.ts         # Tipos de usuário
│   ├── utils/              # Utilitários
│   │   ├── chessAI.ts      # Motor de IA
│   │   ├── audio.ts        # Sons do jogo
│   │   └── formatters.ts   # Formatação de dados
│   ├── test/               # Testes
│   │   ├── chessAI.test.ts
│   │   ├── puzzleService.test.ts
│   │   └── setup.ts
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos globais
├── public/                 # Arquivos estáticos
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts        # Configuração de testes
```

### Tecnologias Principais

- **React 19**: Biblioteca UI com TypeScript
- **Vite**: Build tool ultrarrápido
- **chess.js**: Biblioteca de lógica de xadrez
- **react-chessboard**: Componente de tabuleiro interativo
- **Firebase**: Backend para dados e multiplayer
- **Vitest**: Framework de testes
- **TypeScript**: Tipagem estática

## 🎨 Design System

### Cores
- **Primary**: `#e58e26` (Laranja dourado)
- **Background**: `#121110` (Fundo escuro)
- **Surface**: `#1c1b18` (Superfície)
- **Border**: `#2d2b27` (Bordas)
- **Success**: `#629924` (Verde)
- **Danger**: `#c93434` (Vermelho)

### Componentes

#### Button
```tsx
<Button variant="primary" size="md">
  Clique aqui
</Button>
```

#### Card
```tsx
<Card variant="default" padding="lg">
  Conteúdo do card
</Card>
```

#### Badge
```tsx
<Badge variant="primary" size="sm">
  Tag
</Badge>
```

## 🧪 Testes

O projeto possui cobertura de testes para serviços críticos:

- **puzzleService**: 17 testes cobrindo validação, estatísticas e gerenciamento de puzzles
- **chessAI**: 11 testes validando algoritmos e comportamento da IA

```bash
npm run test:run
```

## 📊 Performance

### Otimizações Implementadas
- **Code Splitting**: Componentes carregados sob demanda com React.lazy()
- **Manual Chunks**: Separação de dependências em chunks otimizados
- **Bundle Size**: Chunks separados para React, Chess, Firebase
- **Lazy Loading**: Carregamento de features apenas quando necessário

### Resultados de Build
- **Total Bundle**: ~290KB (React vendor)
- **Chess Vendor**: ~35KB
- **Firebase Vendor**: ~175KB
- **App Code**: ~15KB (dividido em chunks menores)

## 🔧 Configuração

### Firebase
Para usar o Firebase, configure as credenciais em `src/service/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### Temas
O aplicativo suporta temas claro e escuro, configuráveis via componente Settings.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob licença MIT.

## 🙏 Agradecimentos

- [chess.js](https://github.com/jhlywa/chess.js) - Biblioteca de xadrez
- [react-chessboard](https://github.com/Clariity/react-chessboard) - Componente de tabuleiro
- [Firebase](https://firebase.google.com/) - Backend services
- [Vite](https://vitejs.dev/) - Build tool
