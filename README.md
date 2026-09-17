<div align="center">

# 📻 Radio Drack
### World Radio Explorer — Globo 3D Interativo com Modo GPS de Ruas

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r158-000?style=flat-square&logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com)

**Explore rádios do mundo inteiro em tempo real através de um globo 3D fotorrealístico estilo NASA.**
Dê zoom e mergulhe nas ruas de qualquer cidade com o modo GPS Leaflet — com nomes de ruas, bairros e marcos.

[🌍 Demo ao Vivo](https://radio-drack.vercel.app) · [🐛 Reportar Bug](https://github.com/matador284/Radio-Drack/issues) · [💡 Sugerir Feature](https://github.com/matador284/Radio-Drack/issues)

</div>

---

## ✨ Funcionalidades

| Recurso | Descrição |
|---|---|
| 🌍 **Globo 3D NASA** | Terra fotorrealística com nuvens, atmosfera Rayleigh, estrelas e beacons pulsantes por cidade |
| 🗺️ **Modo GPS de Ruas** | Mapa Leaflet com nomes de ruas, bairros, avenidas e marcadores de rádio interativos — modo escuro CARTO |
| 📻 **+650 Rádios Brasileiras** | Curadas por estado: SP, RJ, MG, BA, DF, RS, PR, PE, CE, **GO**, AM, SC |
| 🌐 **Radio Browser API** | Acesso a +30.000 estações globais com failover automático entre 3 servidores espelho |
| 🎧 **Player Persistente** | Player de áudio com visualizador, controle de volume, mute, próxima/anterior estação |
| 🔍 **Busca Global** | Command Palette (Ctrl+K / Cmd+K) com busca por cidade, país ou gênero musical |
| ❤️ **Biblioteca Pessoal** | Favoritos, histórico de escuta e cidades visitadas — todos salvos no localStorage |
| 🌏 **5 Idiomas** | Português 🇧🇷, English 🇺🇸, Español 🇪🇸, Français 🇫🇷, 日本語 🇯🇵 — seletor no menu |
| 🎲 **Viagem Aleatória** | Botão "Me leve a algum lugar" voa o globo para uma cidade aleatória e toca rádio automaticamente |
| 📖 **Página Discover** | Editorial com coleções temáticas: Globais, Destaque Brasil, por Gênero e por Região |
| 💫 **Intro Cinematográfica** | Splash screen animada na primeira visita |

---

## 🖥️ Como Usar

### Globo 3D
- **Arrastar** → girar o planeta
- **Scroll/Pinch** → zoom in/out
- **Clique num beacon** → selecionar cidade e ver estações
- **Duplo clique** → mergulhar direto no Modo GPS de Ruas
- **Zoom extremo** → transição automática para GPS

### Modo GPS de Ruas
- Mapa dark com nomes de ruas, bairros e marcos
- Marcadores de estações de rádio distribuídos pela cidade
- Clique no marcador → popup com info + botão **SINTONIZAR AGORA**
- Botão **↩ Voltar ao Globo** no canto superior

### Player de Rádio
- **▶/⏸** → play/pause
- **⏮/⏭** → estação anterior/próxima da cidade atual
- **🔊** → slider de volume + botão mute
- **♡** → salvar como favorito
- Status: `SINTONIZANDO...` / `NO AR` / `SINAL PERDIDO`

### Command Palette (Ctrl+K / Cmd+K)
- Busca por nome de cidade, país ou gênero
- Navega com ↑↓ teclado, seleciona com Enter

---

## 🗺️ Estados e Cidades Brasileiras

| Estado | Cidade | Destaques |
|---|---|---|
| 🟢 São Paulo | São Paulo | Alpha FM, Antena 1, Jovem Pan, 89 FM Rock, Kiss FM, Metropolitana, Energia 97... |
| 🔵 Rio de Janeiro | Rio de Janeiro | JB FM 99.9, Rádio Cidade 102.7, Super Rádio Tupi, Bossa Jazz Brasil... |
| 🟡 Minas Gerais | Belo Horizonte | Rádio Itatiaia 95.7, Alvorada FM 94.9... |
| 🟠 Bahia | Salvador | Piatã FM 94.3, Rádio Sociedade 102.5... |
| 🔴 Distrito Federal | Brasília | Rádio Senado 91.7, Rádio Nacional 980 AM... |
| ⚪ Rio Grande do Sul | Porto Alegre | Rádio Gaúcha 93.7, Atlântida FM 94.3... |
| 🟤 Paraná | Curitiba | 91 Rock 91.3 FM... |
| 🟣 Pernambuco | Recife | Rádio Jornal 90.3 FM... |
| 🔶 Ceará | Fortaleza | Jangadeiro FM 88.9... |
| **🟢 Goiás** | **Goiânia** | **Rádio Sertaneja 104.7, Jovem Pan 95.1, Mix FM 100.9, Executiva FM 107.1...** |
| 🔵 Amazonas | Manaus | Rádio Difusora 580 AM, Cultura FM 92.3... |
| 🟡 Santa Catarina | Florianópolis | Floripa FM 103.1, Rádio Itapoá 99.5... |

---

## 🛠️ Tecnologias

```
Frontend:       Next.js 14 (App Router) + React + TypeScript
Estilo:         Tailwind CSS 3.4 + Design System dark luxury
Globo 3D:       Three.js (SphereGeometry, ShaderMaterial Rayleigh halo)
Mapa GPS:       Leaflet.js + CARTO Dark Matter tiles (OpenStreetMap)
Audio:          Web Audio API HTML5
API de Radios:  Radio Browser API (de1, nl1, at1 mirror failover)
Cache:          In-memory + localStorage (favoritos, historico, volume)
Fonte:          Inter (Google Fonts)
Deploy:         Vercel (CI/CD automatico no push)
```

---

## 📦 Instalação

```bash
# Clonar
git clone https://github.com/matador284/Radio-Drack.git
cd Radio-Drack

# Instalar dependencias
npm install

# Rodar em desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🌐 Deploy na Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Ou via GitHub: importe o repo em [vercel.com/new](https://vercel.com/new) — Next.js é detectado automaticamente.

---

## 📁 Estrutura do Projeto

```
Radio-Drack/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Estado global e audio
│   │   ├── layout.tsx               # Layout root
│   │   └── globals.css              # CSS global
│   ├── components/
│   │   ├── Globe/
│   │   │   ├── GlobeView.tsx        # Globo 3D NASA (Three.js)
│   │   │   ├── StreetMapView.tsx    # Modo GPS (Leaflet)
│   │   │   ├── GlobeOverlay.tsx     # HUD sobre o globo
│   │   │   ├── CityStationsDrawer.tsx
│   │   │   └── TuningOverlay.tsx
│   │   ├── Player/
│   │   │   ├── RadioPlayer.tsx      # Player inferior persistente
│   │   │   └── AudioVisualizer.tsx  # Visualizador de audio
│   │   ├── Views/
│   │   │   ├── ExploreView.tsx      # View globo + GPS
│   │   │   ├── DiscoverView.tsx     # Pagina editorial
│   │   │   └── LibraryView.tsx      # Biblioteca pessoal
│   │   ├── Search/CommandPalette.tsx
│   │   ├── Spotlight/SpotlightBar.tsx
│   │   ├── Intro/IntroSplash.tsx
│   │   ├── Navigation.tsx
│   │   └── LanguageSelector.tsx
│   └── lib/
│       ├── types.ts                 # Interfaces TypeScript
│       ├── cities.ts                # +40 cidades mundiais
│       ├── brazilStations.ts        # +650 radios BR por estado
│       ├── curatedStations.ts       # Spotlight internacionais
│       ├── api.ts                   # Cliente Radio Browser API
│       ├── storage.ts               # Helpers localStorage
│       └── translations.ts          # i18n: PT/EN/ES/FR/JA
├── package.json
├── tailwind.config.ts
└── README.md
```

---

## 🌍 Idiomas

| Idioma | Código | Status |
|---|---|---|
| 🇧🇷 Português (Brasil) | `pt` | ✅ Padrão |
| 🇺🇸 English | `en` | ✅ Completo |
| 🇪🇸 Español | `es` | ✅ Completo |
| 🇫🇷 Français | `fr` | ✅ Completo |
| 🇯🇵 日本語 | `ja` | ✅ Completo |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-radio`)
3. Commit (`git commit -m 'feat: adicionar Radio X de Y'`)
4. Push (`git push origin feature/nova-radio`)
5. Abra um Pull Request

### Adicionar novas rádios

Edite `src/lib/brazilStations.ts`:

```typescript
{
  changeuuid: "br-go-exemplo",
  stationuuid: "br-go-exemplo",
  name: "Nome da Radio FM 99.9",
  url: "https://stream.url.mp3",
  url_resolved: "https://stream.url.mp3",
  homepage: "https://seusite.com.br",
  favicon: "",
  tags: "genero,goiania,goias",
  country: "Brazil",
  countrycode: "BR",
  state: "Goiás",
  language: "portuguese",
  votes: 1000,
  codec: "MP3",
  bitrate: 128,
  hls: 0,
  lastcheckok: 1,
  geo_lat: -16.6869,
  geo_long: -49.2648,
}
```

---

## 📄 Licença

MIT — veja [`LICENSE`](./LICENSE).

---

<div align="center">

Feito com 💛 no Brasil · [Radio Browser API](https://www.radio-browser.info/) · [Three.js](https://threejs.org/) · [Leaflet](https://leafletjs.com/) · [Next.js](https://nextjs.org/)

</div>
