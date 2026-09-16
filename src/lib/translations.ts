export type Language = "pt" | "en" | "es" | "fr" | "ja";

export interface TranslationDict {
  code: Language;
  name: string;
  flag: string;
  nav: {
    explore: string;
    discover: string;
    library: string;
    searchPlaceholder: string;
    takeMeSomewhere: string;
    language: string;
  };
  intro: {
    tag: string;
    headline1: string;
    headline2: string;
    subheadline: string;
    startExploring: string;
    skip: string;
  };
  globe: {
    nextDestination: string;
    stationsAvailable: string;
    liveFeed: string;
    exploreStations: string;
    somewhereNew: string;
    local: string;
    world: string;
    tuningMessages: string[];
    randomTripMessage: (city: string) => string;
  };
  drawer: {
    stationsIn: string;
    frequenciesFound: string;
    noStations: string;
    tryNearby: string;
    apiIndex: string;
  };
  spotlight: {
    title: string;
  };
  discover: {
    title: string;
    badge: string;
    desc: string;
    frequencies: string;
    tuneIn: string;
    pause: string;
    categories: {
      aroundWorld: { title: string; subtitle: string };
      brazil: { title: string; subtitle: string };
      electronic: { title: string; subtitle: string };
      lateNight: { title: string; subtitle: string };
      jazz: { title: string; subtitle: string };
      news: { title: string; subtitle: string };
    };
  };
  library: {
    title: string;
    badge: string;
    desc: string;
    favorites: string;
    history: string;
    cities: string;
    noFavorites: string;
    noFavoritesDesc: string;
    noHistory: string;
    noHistoryDesc: string;
    noCities: string;
    noCitiesDesc: string;
    jumpToGlobe: string;
  };
  player: {
    selectToTune: string;
    live: string;
    tuning: string;
    signalLost: string;
    tryAgain: string;
    copied: string;
    previous: string;
    next: string;
    favorite: string;
    share: string;
    mute: string;
    unmute: string;
    ready: string;
  };
  command: {
    placeholder: string;
    promptTitle: string;
    promptSubtitle: string;
    cities: string;
    stations: string;
    flyGlobe: string;
    noResults: (q: string) => string;
    escClose: string;
    enterSelect: string;
    registry: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  pt: {
    code: "pt",
    name: "Português (BR)",
    flag: "🇧🇷",
    nav: {
      explore: "Explorar",
      discover: "Descobrir",
      library: "Biblioteca",
      searchPlaceholder: "Buscar estações, cidades ou países…",
      takeMeSomewhere: "Me leve a algum lugar",
      language: "Idioma",
    },
    intro: {
      tag: "RADIO DRACK · ATLAS GLOBAL",
      headline1: "Um mundo de som.",
      headline2: "Milhares de rádios.\nUm só planeta.",
      subheadline:
        "Ondas de rádio atmosféricas transmitidas em tempo real diretamente de cidades de todos os continentes.",
      startExploring: "COMEÇAR A EXPLORAR",
      skip: "Pular introdução",
    },
    globe: {
      nextDestination: "PRÓXIMO DESTINO",
      stationsAvailable: "ESTAÇÕES DISPONÍVEIS",
      liveFeed: "TRANSMISSÃO AO VIVO",
      exploreStations: "Explorar Estações",
      somewhereNew: "Outro lugar",
      local: "LOCAL",
      world: "MUNDO",
      tuningMessages: [
        "Sintonizando as ondas do rádio…",
        "Cruzando o hemisfério…",
        "Alinhando coordenadas…",
        "Captando a frequência…",
        "Conectando com o sinal…",
      ],
      randomTripMessage: (city: string) => `Cruzando o Atlântico… Sintonizando ${city}`,
    },
    drawer: {
      stationsIn: "ESTAÇÕES EM",
      frequenciesFound: "frequências ativas encontradas",
      noStations: "Nenhuma rádio ativa encontrada nesta região.",
      tryNearby: "Tente sintonizar cidades vizinhas.",
      apiIndex: "ÍNDICE",
    },
    spotlight: {
      title: "DESTAQUES · FREQUÊNCIAS SELECIONADAS",
    },
    discover: {
      title: "Descobrir.",
      badge: "CURADORIA EDITORIAL",
      desc: "Viagens acústicas por gêneros, continentes e frequências do mundo. Escolha uma prateleira e deixe a transmissão te levar.",
      frequencies: "FREQUÊNCIAS",
      tuneIn: "OUVIR",
      pause: "PAUSAR",
      categories: {
        aroundWorld: {
          title: "Pelo mundo",
          subtitle: "Estações aclamadas transmitindo identidades culturais atemporais",
        },
        brazil: {
          title: "Brasil Especial",
          subtitle: "MPB, bossa nova, samba-rock e frequências brasileiras de São Paulo à Bahia",
        },
        electronic: {
          title: "Eletrônica & Pista",
          subtitle: "House, techno, synthwave e sets de clubes globais",
        },
        lateNight: {
          title: "Madrugada & Ambient",
          subtitle: "Ambient sutil, jazz noturno, downtempo e texturas etéreas",
        },
        jazz: {
          title: "Jazz & Blues",
          subtitle: "Metais acústicos, arquivos Blue Note e inovadores contemporâneos",
        },
        news: {
          title: "Notícias & Conversa",
          subtitle: "Jornalismo global, programas falados, cultura e debates ao vivo",
        },
      },
    },
    library: {
      title: "Biblioteca.",
      badge: "FREQUÊNCIAS PESSOAIS",
      desc: "Suas rádios salvas, transmissões recentes e coordenadas exploradas pelo planeta.",
      favorites: "FAVORITAS",
      history: "HISTÓRICO RECENTE",
      cities: "CIDADES VISITADAS",
      noFavorites: "Nenhuma rádio salva ainda",
      noFavoritesDesc:
        "Clique no ícone de coração em qualquer estação para guardá-la em sua biblioteca.",
      noHistory: "Histórico de reprodução vazio",
      noHistoryDesc: "Sintonize qualquer rádio para começar a registrar sua linha do tempo.",
      noCities: "Nenhuma cidade visitada ainda",
      noCitiesDesc: "Navegue pelo globo 3D para carimbar seu passaporte de frequências.",
      jumpToGlobe: "Ver no globo →",
    },
    player: {
      selectToTune: "Selecione uma estação ou cidade no globo para sintonizar",
      live: "AO VIVO",
      tuning: "SINTONIZANDO…",
      signalLost: "SINAL PERDIDO",
      tryAgain: "TENTAR DE NOVO",
      copied: "COPIADO!",
      previous: "Estação Anterior",
      next: "Próxima Estação",
      favorite: "Favoritar Estação",
      share: "Compartilhar Frequência",
      mute: "Mutar",
      unmute: "Desmutar",
      ready: "RADIO DRACK · PRONTO",
    },
    command: {
      placeholder: "Buscar frequência, rádio, cidade ou país…",
      promptTitle: "Digite uma cidade, país ou gênero",
      promptSubtitle: "Exemplos: São Paulo, Paris, Tóquio, Jazz, Eletrônica, MPB",
      cities: "CIDADES",
      stations: "ESTAÇÕES DE RÁDIO",
      flyGlobe: "Voar no Globo →",
      noResults: (q: string) => `Nenhuma frequência direta encontrada para "${q}".`,
      escClose: "[ESC] fechar",
      enterSelect: "[ENTER] selecionar",
      registry: "REGISTRO DE FREQUÊNCIAS RADIO DRACK",
    },
  },

  en: {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    nav: {
      explore: "Explore",
      discover: "Discover",
      library: "Library",
      searchPlaceholder: "Search stations, cities or countries…",
      takeMeSomewhere: "Take me somewhere",
      language: "Language",
    },
    intro: {
      tag: "RADIO DRACK · WORLD ATLAS",
      headline1: "A world of sound.",
      headline2: "Thousands of stations.\nOne planet.",
      subheadline:
        "Real-time atmospheric radio waves streamed directly from cities across every continent.",
      startExploring: "START EXPLORING",
      skip: "Skip intro",
    },
    globe: {
      nextDestination: "NEXT DESTINATION",
      stationsAvailable: "STATIONS AVAILABLE",
      liveFeed: "LIVE FEED",
      exploreStations: "Explore Stations",
      somewhereNew: "Somewhere new",
      local: "LOCAL",
      world: "WORLD",
      tuningMessages: [
        "Searching the airwaves…",
        "Crossing the hemisphere…",
        "Aligning coordinates…",
        "Catching the frequency…",
        "Connecting to signal…",
      ],
      randomTripMessage: (city: string) => `Crossing the Atlantic… Tuning into ${city}`,
    },
    drawer: {
      stationsIn: "STATIONS IN",
      frequenciesFound: "broadcast frequencies found",
      noStations: "No live stations returned for this region.",
      tryNearby: "Try scanning nearby frequencies.",
      apiIndex: "INDEX",
    },
    spotlight: {
      title: "SPOTLIGHT · CURATED FREQUENCIES",
    },
    discover: {
      title: "Discover.",
      badge: "EDITORIAL CURATION",
      desc: "Curated acoustic journeys through genres, continents and underground frequencies. Pick a shelf and let the broadcast carry you.",
      frequencies: "FREQUENCIES",
      tuneIn: "TUNE IN",
      pause: "PAUSE",
      categories: {
        aroundWorld: {
          title: "Around the world",
          subtitle: "Globally acclaimed stations broadcasting timeless cultural streams",
        },
        brazil: {
          title: "Brazil",
          subtitle: "MPB, bossa nova, samba-rock and Brazilian frequencies from São Paulo to Bahia",
        },
        electronic: {
          title: "Electronic & Club",
          subtitle: "House, techno, synthwave and deep warehouse sets worldwide",
        },
        lateNight: {
          title: "Late night",
          subtitle: "Subtle ambient, midnight jazz, downtempo and ethereal textures",
        },
        jazz: {
          title: "Jazz & Blues",
          subtitle: "Pure acoustic brass, blue note archives and contemporary innovators",
        },
        news: {
          title: "News & Talk",
          subtitle: "Global journalism, spoken word, culture and live discussion",
        },
      },
    },
    library: {
      title: "Library.",
      badge: "PERSONAL FREQUENCIES",
      desc: "Your saved broadcasts, recent transmissions, and logged coordinates across the globe.",
      favorites: "FAVORITES",
      history: "RECENTLY PLAYED",
      cities: "CITIES VISITED",
      noFavorites: "No saved stations yet",
      noFavoritesDesc:
        "Click the heart icon on any station while exploring to store it here.",
      noHistory: "Listening history is clear",
      noHistoryDesc: "Tune into any radio to start recording your personal transmission timeline.",
      noCities: "No cities visited yet",
      noCitiesDesc: "Navigate the 3D globe to log travel destinations in your personal radio passport.",
      jumpToGlobe: "Jump to on globe →",
    },
    player: {
      selectToTune: "Select a station or city on the globe to tune in",
      live: "LIVE",
      tuning: "TUNING…",
      signalLost: "SIGNAL LOST",
      tryAgain: "TRY AGAIN",
      copied: "COPIED!",
      previous: "Previous Station",
      next: "Next Station",
      favorite: "Favorite Station",
      share: "Share Station",
      mute: "Mute",
      unmute: "Unmute",
      ready: "RADIO DRACK · READY",
    },
    command: {
      placeholder: "Find a frequency, station, city or country…",
      promptTitle: "Type a city, country, or genre",
      promptSubtitle: "Examples: São Paulo, Paris, Tokyo, Jazz, Ambient, Electronic",
      cities: "CITIES",
      stations: "STATIONS",
      flyGlobe: "Fly on Globe →",
      noResults: (q: string) => `No direct frequencies found for "${q}".`,
      escClose: "[ESC] to close",
      enterSelect: "[ENTER] to select",
      registry: "RADIO DRACK FREQUENCY REGISTRY",
    },
  },

  es: {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
    nav: {
      explore: "Explorar",
      discover: "Descubrir",
      library: "Biblioteca",
      searchPlaceholder: "Buscar emisoras, ciudades o países…",
      takeMeSomewhere: "Llévame a algún lugar",
      language: "Idioma",
    },
    intro: {
      tag: "RADIO DRACK · ATLAS MUNDIAL",
      headline1: "Un mundo de sonido.",
      headline2: "Miles de estaciones.\nUn solo planeta.",
      subheadline:
        "Ondas de radio atmosféricas transmitidas en tiempo real directamente desde ciudades de todos los continentes.",
      startExploring: "EMPEZAR A EXPLORAR",
      skip: "Saltar intro",
    },
    globe: {
      nextDestination: "PRÓXIMO DESTINO",
      stationsAvailable: "ESTACIONES DISPONIBLES",
      liveFeed: "EMISIÓN EN VIVO",
      exploreStations: "Explorar Estaciones",
      somewhereNew: "Otro lugar",
      local: "LOCAL",
      world: "MUNDO",
      tuningMessages: [
        "Buscando en las ondas…",
        "Cruzando el hemisferio…",
        "Alineando coordenadas…",
        "Captando la frecuencia…",
      ],
      randomTripMessage: (city: string) => `Cruzando el Atlántico… Sintonizando ${city}`,
    },
    drawer: {
      stationsIn: "ESTACIONES EN",
      frequenciesFound: "frecuencias encontradas",
      noStations: "No hay estaciones en vivo para esta región.",
      tryNearby: "Intenta sintonizar ciudades cercanas.",
      apiIndex: "ÍNDICE",
    },
    spotlight: {
      title: "DESTACADAS · FRECUENCIAS SELECCIONADAS",
    },
    discover: {
      title: "Descubrir.",
      badge: "CURADURÍA EDITORIAL",
      desc: "Viajes acústicos por géneros y continentes. Elige una estantería y déjate llevar.",
      frequencies: "FRECUENCIAS",
      tuneIn: "ESCUCHAR",
      pause: "PAUSAR",
      categories: {
        aroundWorld: {
          title: "Por el mundo",
          subtitle: "Emisoras aclamadas con identidades culturales globales",
        },
        brazil: {
          title: "Brasil",
          subtitle: "MPB, bossa nova, samba y ritmos brasileños",
        },
        electronic: {
          title: "Electrónica & Club",
          subtitle: "House, techno, synthwave y sets de club",
        },
        lateNight: {
          title: "Medianoche & Ambient",
          subtitle: "Ambient suave, jazz nocturno y downtempo",
        },
        jazz: {
          title: "Jazz & Blues",
          subtitle: "Metales acústicos, clásicos y vanguardia",
        },
        news: {
          title: "Noticias & Charlas",
          subtitle: "Periodismo internacional, opinión y cultura",
        },
      },
    },
    library: {
      title: "Biblioteca.",
      badge: "FRECUENCIAS PERSONALES",
      desc: "Tus emisoras guardadas, reproducciones recientes y coordenadas exploradas.",
      favorites: "FAVORITAS",
      history: "HISTORIAL RECIENTE",
      cities: "CIUDADES VISITADAS",
      noFavorites: "Sin emisoras guardadas",
      noFavoritesDesc: "Haz clic en el corazón de cualquier emisora para guardarla aquí.",
      noHistory: "Historial vacío",
      noHistoryDesc: "Sintoniza una radio para comenzar a registrar tu viaje.",
      noCities: "Sin ciudades visitadas",
      noCitiesDesc: "Explora el globo 3D para registrar tus destinos.",
      jumpToGlobe: "Ver en el globo →",
    },
    player: {
      selectToTune: "Selecciona una emisora o ciudad en el globo para sintonizar",
      live: "EN VIVO",
      tuning: "SINTONIZANDO…",
      signalLost: "SEÑAL PERDIDA",
      tryAgain: "REINTENTAR",
      copied: "¡COPIADO!",
      previous: "Emisora Anterior",
      next: "Próxima Emisora",
      favorite: "Favorita",
      share: "Compartir",
      mute: "Silenciar",
      unmute: "Activar sonido",
      ready: "RADIO DRACK · LISTO",
    },
    command: {
      placeholder: "Buscar emisora, ciudad o país…",
      promptTitle: "Escribe una ciudad, país o género",
      promptSubtitle: "Ejemplos: São Paulo, París, Tokio, Jazz, Electrónica",
      cities: "CIUDADES",
      stations: "EMISORAS",
      flyGlobe: "Volar en el Globo →",
      noResults: (q: string) => `No se encontraron frecuencias para "${q}".`,
      escClose: "[ESC] cerrar",
      enterSelect: "[ENTER] seleccionar",
      registry: "REGISTRO DE FRECUENCIAS RADIO DRACK",
    },
  },

  fr: {
    code: "fr",
    name: "Français",
    flag: "🇫🇷",
    nav: {
      explore: "Explorer",
      discover: "Découvrir",
      library: "Bibliothèque",
      searchPlaceholder: "Rechercher stations, villes ou pays…",
      takeMeSomewhere: "Emmène-moi quelque part",
      language: "Langue",
    },
    intro: {
      tag: "RADIO DRACK · ATLAS MONDIAL",
      headline1: "Un monde de son.",
      headline2: "Des milliers de stations.\nUne seule planète.",
      subheadline:
        "Ondes radio diffusées en direct depuis les villes de tous les continents.",
      startExploring: "COMMENCER L'EXPLORATION",
      skip: "Passer l'intro",
    },
    globe: {
      nextDestination: "PROCHAINE DESTINATION",
      stationsAvailable: "STATIONS DISPONIBLES",
      liveFeed: "EN DIRECT",
      exploreStations: "Explorer les stations",
      somewhereNew: "Ailleurs",
      local: "LOCAL",
      world: "MONDE",
      tuningMessages: [
        "Recherche sur les ondes…",
        "Traversée de l'hémisphère…",
        "Alignement des coordonnées…",
      ],
      randomTripMessage: (city: string) => `Traversée de l'Atlantique… Connexion à ${city}`,
    },
    drawer: {
      stationsIn: "STATIONS À",
      frequenciesFound: "fréquences actives trouvées",
      noStations: "Aucune station en direct pour cette région.",
      tryNearby: "Essayez de syntoniser les villes voisines.",
      apiIndex: "INDEX",
    },
    spotlight: {
      title: "À LA UNE · SÉLECTION",
    },
    discover: {
      title: "Découvrir.",
      badge: "SÉLECTION ÉDITORIALE",
      desc: "Voyages acoustiques à travers les genres et les continents.",
      frequencies: "FRÉQUENCES",
      tuneIn: "ÉCOUTER",
      pause: "PAUSE",
      categories: {
        aroundWorld: {
          title: "Autour du monde",
          subtitle: "Stations emblématiques diffusant des ondes culturelles",
        },
        brazil: {
          title: "Brésil",
          subtitle: "MPB, bossa nova, samba et rythmes brésiliens",
        },
        electronic: {
          title: "Électro & Club",
          subtitle: "House, techno, synthwave et sets club",
        },
        lateNight: {
          title: "Nuit & Ambient",
          subtitle: "Ambient subtil, jazz nocturne et downtempo",
        },
        jazz: {
          title: "Jazz & Blues",
          subtitle: "Cuivres acoustiques, Blue Note et jazz contemporain",
        },
        news: {
          title: "Infos & Débats",
          subtitle: "Journalisme international et culture",
        },
      },
    },
    library: {
      title: "Bibliothèque.",
      badge: "FRÉQUENCES PERSONNELLES",
      desc: "Vos stations enregistrées, votre historique et vos villes explorées.",
      favorites: "FAVORIS",
      history: "RÉCEMMENT ÉCOUTÉ",
      cities: "VILLES VISITÉES",
      noFavorites: "Aucun favori enregistré",
      noFavoritesDesc: "Cliquez sur le cœur d'une station pour l'enregistrer ici.",
      noHistory: "Historique vide",
      noHistoryDesc: "Écoutez une radio pour commencer votre historique.",
      noCities: "Aucune ville visitée",
      noCitiesDesc: "Explorez le globe 3D pour enregistrer vos voyages.",
      jumpToGlobe: "Voir sur le globe →",
    },
    player: {
      selectToTune: "Sélectionnez une station ou une ville sur le globe",
      live: "EN DIRECT",
      tuning: "SYNTONISATION…",
      signalLost: "SIGNAL PERDU",
      tryAgain: "RÉESSAYER",
      copied: "COPIÉ !",
      previous: "Station précédente",
      next: "Station suivante",
      favorite: "Favori",
      share: "Partager",
      mute: "Couper le son",
      unmute: "Activer le son",
      ready: "RADIO DRACK · PRÊT",
    },
    command: {
      placeholder: "Trouver une fréquence, station, ville ou pays…",
      promptTitle: "Entrez une ville, un pays ou un genre",
      promptSubtitle: "Exemples : São Paulo, Paris, Tokyo, Jazz, Électronique",
      cities: "VILLES",
      stations: "STATIONS",
      flyGlobe: "Voler sur le globe →",
      noResults: (q: string) => `Aucune fréquence trouvée pour "${q}".`,
      escClose: "[ESC] fermer",
      enterSelect: "[ENTER] sélectionner",
      registry: "REGISTRE RADIO DRACK",
    },
  },

  ja: {
    code: "ja",
    name: "日本語",
    flag: "🇯🇵",
    nav: {
      explore: "探索",
      discover: "発見",
      library: "ライブラリ",
      searchPlaceholder: "放送局、都市、国を検索…",
      takeMeSomewhere: "どこかへ旅立つ",
      language: "言語",
    },
    intro: {
      tag: "RADIO DRACK · 世界アトラス",
      headline1: "音の世界へ。",
      headline2: "何千ものラジオ局。\nひとつの惑星。",
      subheadline: "世界中の都市からリアルタイムに響く大気圏ラジオウェーブ。",
      startExploring: "探索を開始する",
      skip: "スキップ",
    },
    globe: {
      nextDestination: "次の目的地",
      stationsAvailable: "利用可能な局",
      liveFeed: "ライブ配信",
      exploreStations: "ステーションを見る",
      somewhereNew: "別の場所へ",
      local: "ローカル",
      world: "ワールド",
      tuningMessages: [
        "電波をスキャン中…",
        "地球を横断中…",
        "周波数を調整中…",
      ],
      randomTripMessage: (city: string) => `${city}の周波数に接続中…`,
    },
    drawer: {
      stationsIn: "放送中のステーション：",
      frequenciesFound: "件の周波数を検出",
      noStations: "この地域でアクティブな放送局は見つかりませんでした。",
      tryNearby: "近隣の都市をお試しください。",
      apiIndex: "インデックス",
    },
    spotlight: {
      title: "注目 · 厳選ステーション",
    },
    discover: {
      title: "発見.",
      badge: "エディトリアル選曲",
      desc: "ジャンルと大陸を巡る音の旅。チャンネルを選び、電波に身を委ねてください。",
      frequencies: "局",
      tuneIn: "再生",
      pause: "一時停止",
      categories: {
        aroundWorld: {
          title: "世界一周",
          subtitle: "世界中で愛されるタイムレスな文化放送局",
        },
        brazil: {
          title: "ブラジル特集",
          subtitle: "MPB、ボサノヴァ、サンバロック、サンパウロからバイーアまで",
        },
        electronic: {
          title: "エレクトロニック & クラブ",
          subtitle: "ハウス、テクノ、シンセウェーブ、世界屈指のクラブセット",
        },
        lateNight: {
          title: "真夜中 & アンビエント",
          subtitle: "静謐なアンビエント、深夜のジャズ、ダウンテンポ",
        },
        jazz: {
          title: "ジャズ & ブルース",
          subtitle: "アコースティックブラス、Blue Noteアーカイブ、現代の革新者たち",
        },
        news: {
          title: "ニュース & トーク",
          subtitle: "世界のジャーナリズム、トーク番組、文化議論",
        },
      },
    },
    library: {
      title: "ライブラリ.",
      badge: "マイ周波数",
      desc: "保存した放送局、最近の再生履歴、地球上で訪問した都市の記録。",
      favorites: "お気に入り",
      history: "最近の再生",
      cities: "訪問した都市",
      noFavorites: "保存した局はまだありません",
      noFavoritesDesc: "気になる局のハートアイコンをクリックしてお気に入りに追加します。",
      noHistory: "再生履歴はありません",
      noHistoryDesc: "ラジオを聴くとここにタイムラインが記録されます。",
      noCities: "訪問都市はありません",
      noCitiesDesc: "3D地球儀を巡って、あなたのラジオパスポートを更新しましょう。",
      jumpToGlobe: "地球儀で見る →",
    },
    player: {
      selectToTune: "地球儀上の都市または放送局を選択してチューニング",
      live: "LIVE",
      tuning: "チューニング中…",
      signalLost: "信号ロスト",
      tryAgain: "再試行",
      copied: "コピー完了!",
      previous: "前の局",
      next: "次の局",
      favorite: "お気に入り",
      share: "共有",
      mute: "ミュート",
      unmute: "ミュート解除",
      ready: "RADIO DRACK · 準備完了",
    },
    command: {
      placeholder: "周波数、放送局、都市、国を検索…",
      promptTitle: "都市、国、ジャンルを入力",
      promptSubtitle: "例：サンパウロ、パリ、東京、Jazz、Electronic",
      cities: "都市",
      stations: "放送局",
      flyGlobe: "地球儀でジャンプ →",
      noResults: (q: string) => `"${q}" に一致する周波数は見つかりませんでした。`,
      escClose: "[ESC] 閉じる",
      enterSelect: "[ENTER] 選択",
      registry: "RADIO DRACK FREQUENCY REGISTRY",
    },
  },
};
