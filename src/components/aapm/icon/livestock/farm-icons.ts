/**
 * Layer-farm icon set, vendored from allsvgicons.com (Iconify sets), picked by the user on 2026-11-05.
 * Generated verbatim from the registry JSON (only stroke-width 1.5 → 1.75 on outline sets, so they
 * sit next to Lucide). Licences and authors: ./ATTRIBUTION.md. Colour is always currentColor.
 * wordpress:shipping (GPL) is not used — shipping is Lucide `truck`.
 * Static, trusted markup (no user input), rendered through `innerHTML` on the svg root.
 */
import { defineComponent, h } from 'vue'

interface FarmGlyph {
  name: string
  /** `<set>:<icon>` on Iconify / allsvgicons. */
  source: string
  viewBox: string
  body: string
  kind: 'stroke' | 'fill'
}

function farmIcon({ name, source, viewBox, body, kind }: FarmGlyph) {
  return defineComponent({
    name,
    props: {
      size: { type: [Number, String], default: 24 },
    },
    setup(props) {
      return () => h('svg', {
        'xmlns': 'http://www.w3.org/2000/svg',
        viewBox,
        'width': props.size,
        'height': props.size,
        'fill': kind === 'fill' ? 'currentColor' : 'none',
        'class': 'aapm-livestock',
        'data-source': source,
        'innerHTML': body,
      })
    },
  })
}

/** Ayam (umum) — the user's pick for the general chicken. fluent-emoji-high-contrast:chicken — MIT, Microsoft. */
export const ChickenGeneralIcon = farmIcon({
  name: 'ChickenGeneralIcon',
  source: 'fluent-emoji-high-contrast:chicken',
  viewBox: '0 0 32 32',
  kind: 'fill',
  body: `<path d="M15.42 16.25a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0"/><path d="M21.19 2c3.336.077 4.97 4.034 2.87 6.502a10.35 10.35 0 0 1 3.65 6.085l2.646 11.865c.057.258.081.52.093.748l.001.025v.025a3.748 3.748 0 0 1-6.41 2.643A3.76 3.76 0 0 1 21.38 31a3.74 3.74 0 0 1-2.66-1.107A3.76 3.76 0 0 1 16.06 31a3.74 3.74 0 0 1-2.66-1.108A3.73 3.73 0 0 1 10.71 31c-1.894-.013-3.408-1.44-3.678-3.228a1.84 1.84 0 0 1-.891.228c-1.317 0-2.206-1.34-1.71-2.564l.89-2.126c.113-.268.286-.499.5-.677c-1.13-.302-2.228-.846-3.191-1.818c-.506-.507-.678-1.094-.603-1.691c.05-.395.221-.805.334-1.075l.05-.122l.016-.04l.02-.037c.627-1.244 1.384-2.247 2.327-2.983a6.56 6.56 0 0 1 2.716-1.25q.03-.095.063-.19A3.84 3.84 0 0 1 7 11.61a3.88 3.88 0 0 1 2.76-3.89c.33-.1.55-.4.55-.74v-.01c0-2.14 1.73-3.87 3.87-3.87c.56 0 1.09.12 1.57.33c.76.34 1.66.21 2.3-.33a4.72 4.72 0 0 1 3-1.1zM6.99 19.5H4.146c.806.772 1.757 1.156 2.844 1.343zm0-1v-1.64q0-.515.048-1.019a4.4 4.4 0 0 0-1.033.602c-.599.468-1.144 1.133-1.642 2.057zm18.758-3.523a8.34 8.34 0 0 0-8.574-6.768h-.001c-4.58.197-8.183 4.042-8.183 8.651V27.2c0 .995.79 1.794 1.737 1.8h.004a1.76 1.76 0 0 0 1.453-.758l.002-.003c.587-.82 1.836-.86 2.435.01c.324.458.846.751 1.439.751a1.77 1.77 0 0 0 1.442-.756l.004-.005c.586-.82 1.836-.86 2.435.01c.324.458.846.751 1.439.751a1.77 1.77 0 0 0 1.442-.756l.004-.005c.586-.82 1.836-.86 2.435.01c.324.458.846.751 1.439.751c.96 0 1.737-.77 1.75-1.727a2.5 2.5 0 0 0-.046-.385l-2.653-11.895z"/>`,
})

/** Induk / layer hen (outline). healthicons:animal-chicken-outline — MIT, Resolve to Save Lives. */
export const HenIcon = farmIcon({
  name: 'HenIcon',
  source: 'healthicons:animal-chicken-outline',
  viewBox: '0 0 48 48',
  kind: 'fill',
  body: `<path d="M14 14a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/><path fill-rule="evenodd" d="M15.086 6c1.26-1.26 3.414-.368 3.414 1.414V9h1.586c1.782 0 2.674 2.154 1.414 3.414l-1.793 1.793l-.037.036l3.456 5.847a4 4 0 0 0 4.08 1.914l12.58-2.027c1.63-.263 2.74 1.609 1.728 2.914c-.97 1.251-1.459 2.85-1.812 4.6C38.384 34.02 32.854 39.052 26 39.88V42h2.5v2H19v-2h5v-2c-5.414 0-10.21-2.607-13.107-6.608c-2.324-3.21-1.946-7.335-1.006-10.767l.495-1.805a7 7 0 0 0 .181-2.822L10.5 18H7.914C6.132 18 5.24 15.846 6.5 14.586zm5 5l-1.466 1.466l-.73-1.233a5 5 0 0 0-.307-.455c.275.142.586.222.917.222zM16.5 9c0 .334.082.65.227.926a4.55 4.55 0 0 0-1.894-.845L16.5 7.414zm-8.586 7l1.595-1.594q.06.312.168.624l.334.97zm3.654-1.622a2.548 2.548 0 0 1 4.601-2.127l5.236 8.857a6 6 0 0 0 6.119 2.87l12.148-1.957c-1.082 1.557-1.589 3.383-1.93 5.075a13.1 13.1 0 0 1-1.419 3.815a1 1 0 0 0-.247.222C34.183 33.513 31.378 35 28.264 35C22.654 35 18 30.136 18 24a1 1 0 0 0-2 0c0 7.12 5.432 13 12.264 13q.6 0 1.184-.06A14.4 14.4 0 0 1 24 38c-4.763 0-8.96-2.291-11.487-5.78c-1.766-2.439-1.6-5.773-.697-9.066l.495-1.806a9 9 0 0 0-.171-5.311z" clip-rule="evenodd"/>`,
})

/** DOC / anak ayam. fluent-emoji-high-contrast:baby-chick — MIT, Microsoft. */
export const ChickIcon = farmIcon({
  name: 'ChickIcon',
  source: 'fluent-emoji-high-contrast:baby-chick',
  viewBox: '0 0 32 32',
  kind: 'fill',
  body: `<path d="M9.5 12.83a1.5 1.5 0 1 0 0-3.001a1.5 1.5 0 0 0 0 3"/><path d="m3 13.99l-1.27-.97a1.795 1.795 0 0 1-.022-2.873l1.775-1.495A8.485 8.485 0 0 1 11.48 3a8.47 8.47 0 0 1 8.188 6.262l9.616 2.52A2.295 2.295 0 0 1 31 14c0 7.09-5.269 12.948-12.105 13.873l-.125.627h1.78c.73 0 1.34.52 1.48 1.21c.03.15-.09.29-.25.29H9.25c-.16 0-.28-.14-.24-.29c.14-.69.74-1.21 1.47-1.21h1.8l.246-1.23C6.988 25.404 3 20.168 3 14zM15.52 28.5h1.75l.101-.505Q17.186 28 17 28a14 14 0 0 1-3.053-.334l-.167.834zM11.48 5A6.48 6.48 0 0 0 5 11.48V14c0 6.628 5.372 12 12 12a11.94 11.94 0 0 0 6.253-1.756a9 9 0 0 1-1.984.256h-.009c-3.333 0-6.906-1.65-8.774-4.449a.5.5 0 0 1 .832-.555c1.655 2.48 4.89 4.003 7.937 4.004a8.14 8.14 0 0 0 4.954-1.806A11.95 11.95 0 0 0 29 14a.294.294 0 0 0-.224-.283l-9.66-2.532a1.96 1.96 0 0 1-1.369-1.364l-.002-.007l-.002-.007A6.47 6.47 0 0 0 11.48 5"/>`,
})

/** Penetasan / hatchery. fluent-emoji-high-contrast:hatching-chick — MIT, Microsoft. */
export const HatchingChickIcon = farmIcon({
  name: 'HatchingChickIcon',
  source: 'fluent-emoji-high-contrast:hatching-chick',
  viewBox: '0 0 32 32',
  kind: 'fill',
  body: `<path d="M12.31 8.05a1 1 0 1 1-2 0a1 1 0 0 1 2 0m8.43 1a1 1 0 1 0 0-2a1 1 0 0 0 0 2m-6.986.45h4.492a2.25 2.25 0 0 0-2.252-2.24a2.24 2.24 0 0 0-2.24 2.24"/><path d="m1.642 12.907l2.478 2.478l-1.568 1.568a1 1 0 0 0-.292.707c0 7.602 6.157 13.76 13.76 13.76c7.55 0 13.681-6.09 13.759-13.623a1 1 0 0 0-.282-.854l-1.563-1.563l2.473-2.473c1.417-1.418.417-3.857-1.597-3.857h-3.805C24.51 4.521 20.683 1 16.03 1a9.024 9.024 0 0 0-8.978 8.05H3.24c-2.015 0-3.015 2.44-1.598 3.857M7 11.05v1.916l-.23-.23l-1.235 1.235l-2.478-2.478a.24.24 0 0 1-.074-.132a.3.3 0 0 1 .02-.15a.3.3 0 0 1 .091-.12a.24.24 0 0 1 .146-.041zm-2.734 7.017l1.918-1.917l.626-.538l.19.19v.043l3.116 3.192l.064-.062l.04.04l2.606-2.607l3.199-3.104l5.168 5.084l.627.626l.005-.005l.045.044l1.254-1.327l2.115-2.114l.696.598l1.838 1.838C27.564 24.36 22.38 29.42 16.02 29.42c-6.362 0-11.54-5.044-11.754-11.353m24.726-6.574l-2.472 2.473l-1.24-1.24l-.22.22V11.05h3.75c.07 0 .114.02.145.041c.035.026.07.066.092.12a.3.3 0 0 1 .019.15a.24.24 0 0 1-.073.132m-5.942 3.4l-1.07 1.133l-.16.16l-5.8-5.8l-4.598 4.597l-1.22 1.185L9 14.966v-4.957A7.023 7.023 0 0 1 16.03 3c3.755 0 6.824 2.948 7.02 6.67z"/>`,
})

/** Telur — duotone outline (accent fill at 20%). andrsrxn:eggs — MIT, Andrés Raxón. */
export const EggsIcon = farmIcon({
  name: 'EggsIcon',
  source: 'andrsrxn:eggs',
  viewBox: '0 0 24 24',
  kind: 'stroke',
  body: `<g fill="none"><path fill="currentColor" fill-rule="evenodd" d="M14.63 17.32c4.92.97 6.87-1.85 7.44-6.1c.61-4.5-.63-8.26-3.9-9.14s-6.19 1.94-7.96 5.97l3.12 3.18L14.82 16z" clip-rule="evenodd" opacity=".2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M14.39 14.09c1.13 4.22-1.08 7.09-4.5 8c-3.43.93-6.78-.45-7.91-4.67c-1.13-4.23.76-9.8 3.8-10.62s7.47 3.07 8.6 7.29"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M10.14 7.88c1.56-3.73 5.33-6.71 8.08-5.98c3.04.82 4.93 6.4 3.8 10.62c-1.08 4.02-4.17 5.46-7.42 4.8"/></g>`,
})

/** Tray telur. iconoven:egg-tray — MIT, Appic Marketing. */
export const EggTrayIcon = farmIcon({
  name: 'EggTrayIcon',
  source: 'iconoven:egg-tray',
  viewBox: '0 0 24 24',
  kind: 'stroke',
  body: `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M5 4.5c-1.25 0-2 2.25-2 3.75a2 2 0 0 0 4 0c0-1.5-.75-3.75-2-3.75m7 0c-1.25 0-2 2.25-2 3.75a2 2 0 0 0 4 0c0-1.5-.75-3.75-2-3.75m7 0c-1.25 0-2 2.25-2 3.75a2 2 0 0 0 4 0c0-1.5-.75-3.75-2-3.75M2.75 13.25h18.5l-1.5 6.25a2 2 0 0 1-1.95 1.75H6.2a2 2 0 0 1-1.95-1.75Zm5.75 0v3.25m7-3.25v3.25"/>`,
})

/** Farm / lokasi peternakan. si:barn-line — MIT, Abhimanyu Rana (Sargam Icons). */
export const BarnIcon = farmIcon({
  name: 'BarnIcon',
  source: 'si:barn-line',
  viewBox: '0 0 24 24',
  kind: 'fill',
  body: `<path d="M.587 9.374a.75.75 0 1 0 .826 1.252L1 10zM11.26 3.24l.413.626l.035-.024zm1.44 0l-.448.602l.037.025zm9.889 7.387a.75.75 0 1 0 .823-1.254L23 10zm-.839-1.94a.75.75 0 0 0-1.5 0zm-18-.005a.75.75 0 0 0-1.5 0zM11 11.25a.75.75 0 0 0 0 1.5zm2 1.5a.75.75 0 0 0 0-1.5zM17.25 21a.75.75 0 0 0 1.5 0zm-12 0a.75.75 0 0 0 1.5 0zm.94-1.183a.75.75 0 0 0 .62 1.366L6.5 20.5zm11.62-3.634a.75.75 0 0 0-.62-1.366l.31.683zm-.62 5a.75.75 0 0 0 .62-1.366l-.31.683zM6.81 14.817a.75.75 0 0 0-.62 1.366l.31-.683zM1 10l.413.626l10.26-6.76l-.413-.626l-.413-.626l-10.26 6.76zm10.26-6.76l.448.602a.45.45 0 0 1 .544 0l.448-.602l.448-.602a1.95 1.95 0 0 0-2.336 0zm1.44 0l-.411.627l10.3 6.76L23 10l.412-.627l-10.3-6.76zM21 8.687h-.75V18.6h1.5V8.687zm0 9.913h-.75c0 .916-.734 1.65-1.65 1.65v1.5a3.144 3.144 0 0 0 3.15-3.15zM18.6 21v-.75H5.4v1.5h13.2zM5.4 21v-.75c-.916 0-1.65-.734-1.65-1.65h-1.5a3.144 3.144 0 0 0 3.15 3.15zM3 18.6h.75V8.682h-1.5V18.6zM15 21v-.75H9v1.5h6zm-4-9v.75h2v-1.5h-2zm-4.2 3v.75h10.4v-1.5H6.8zm10.4 0v.75a.05.05 0 0 1 .05.05h1.5a1.55 1.55 0 0 0-1.55-1.55zm.8.8h-.75V21h1.5v-5.2zM6 21h.75v-5.2h-1.5V21zm0-5.2h.75a.05.05 0 0 1 .05-.05v-1.5a1.55 1.55 0 0 0-1.55 1.55zm.5 4.7l.31.683l11-5l-.31-.683l-.31-.683l-11 5zm11 0l.31-.683l-11-5l-.31.683l-.31.683l11 5z"/>`,
})

/** Jagung — corn drying / feed corn. iconoven:corn-cob — MIT, Appic Marketing. */
export const CornIcon = farmIcon({
  name: 'CornIcon',
  source: 'iconoven:corn-cob',
  viewBox: '0 0 24 24',
  kind: 'stroke',
  body: `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 2.75c2.5 0 4 2.5 4 6.5v2.25a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9.25c0-4 1.5-6.5 4-6.5M8 7h8m-8 3h8m-4 11.25C6.5 20.5 3.5 17 2.75 11.5c3.25 2 6.75 5 9.25 9.75m0 0c5.5-.75 8.5-4.25 9.25-9.75c-3.25 2-6.75 5-9.25 9.75"/>`,
})

/** Kandang (coop). iconoven:chicken-coop — MIT, Appic Marketing. */
export const ChickenCoopIcon = farmIcon({
  name: 'ChickenCoopIcon',
  source: 'iconoven:chicken-coop',
  viewBox: '0 0 24 24',
  kind: 'stroke',
  body: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"><path d="M4.75 16.7v-5.65q0-.8.61-1.32l6.03-5.21q.61-.52 1.22 0l6.03 5.21q.61.52.61 1.32v5.65q0 .8-.8.8H5.55q-.8 0-.8-.8"/><path d="M7.75 17.5v-2.25a1.75 1.75 0 0 1 3.5 0v2.25Zm-1.25 0v3.75m11-3.75v3.75m-6.25-3.75L15 21.25"/></g>`,
})

/** Vaksinasi. covid:vaccine-protection-virus — CC BY 4.0, Streamline. */
export const VaccineIcon = farmIcon({
  name: 'VaccineIcon',
  source: 'covid:vaccine-protection-virus',
  viewBox: '0 0 24 24',
  kind: 'stroke',
  body: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"><path d="M12.267.75H9.233m1.517 0v2.6m-5.822-.817L3.856 3.606L2.783 4.678m1.073-1.072l1.838 1.838M1 8.983v3.034M1 10.5h2.6m-.817 5.822l1.073 1.072l1.072 1.073m-1.072-1.073l1.838-1.838M18.717 4.678l-1.073-1.072l-1.072-1.073m1.072 1.073l-1.838 1.838M9.233 9.85a1.517 1.517 0 1 0 0-3.034a1.517 1.517 0 0 0 0 3.034"/><path d="M17.538 8.25A7.15 7.15 0 1 0 8 17.1"/><path d="M23 15.75a7.67 7.67 0 0 1-6 7.5a7.67 7.67 0 0 1-6-7.5V13.5a1.5 1.5 0 0 1 1.5-1.5h9a1.5 1.5 0 0 1 1.5 1.5zM17 15v4.5m-2.25-2.25h4.5"/></g>`,
})

/** Pertumbuhan / produktivitas. streamline-sharp:decent-work-and-economic-growth-remix — CC BY 4.0, Streamline. */
export const GrowthIcon = farmIcon({
  name: 'GrowthIcon',
  source: 'streamline-sharp:decent-work-and-economic-growth-remix',
  viewBox: '0 0 24 24',
  kind: 'fill',
  // Separate equivalent paths let bars rise from their own baseline while the trend draws.
  body: `<path data-growth-trend fill-rule="evenodd" d="M9.884 1.616L9 .732l-.884.884l-7.5 7.5l1.768 1.768L9 4.268l5.616 5.616l.884.884l.884-.884l4.5-4.5L23 7.5l.5-.5V1h-6l-.5.5l2.116 2.116L15.5 7.232z" clip-rule="evenodd"/><rect data-growth-bar x=".75" y="14.5" width="3.5" height="9"/><rect data-growth-bar x="7.083" y="10.5" width="3.5" height="13"/><rect data-growth-bar x="13.417" y="16.5" width="3.5" height="7"/><rect data-growth-bar x="19.75" y="12.5" width="3.5" height="11"/>`,
})
