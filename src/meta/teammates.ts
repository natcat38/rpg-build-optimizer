/** A curated teammate recommendation (ADR-0007-style: static, sourced, overridable-by-ignoring). */
export interface TeammateRec {
  characterKey: string;
  role: string; // e.g. "Anemo buffer"
  why: string; // one sentence, e.g. "Buffs Anemo DMG and shreds Anemo RES."
}

export const TEAMMATES: Record<
  string,
  { recs: TeammateRec[]; source: string }
> = {
  furina: {
    recs: [
      {
        characterKey: 'neuvillette',
        role: 'mono-hydro on-field DPS',
        why: "Neuvillette carries most of the team's damage while Furina's HP-scaling buff and healing keep him hitting harder.",
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo grouping/buffer',
        why: 'Groups enemies and shreds Hydro RES via Viridescent Venerer, amplifying whatever the team is vaporizing.',
      },
      {
        characterKey: 'bennett',
        role: 'ATK buffer + healer',
        why: "His burst heals and buffs ATK hard enough to cover Furina's squishy, low-uptime-until-burst playstyle.",
      },
      {
        characterKey: 'xingqiu',
        role: 'off-field Hydro application',
        why: "Keeps Hydro aura up between Furina's own applications, enabling consistent vaporize.",
      },
    ],
    source: 'https://keqingmains.com/furina/',
  },
  nahida: {
    recs: [
      {
        characterKey: 'alhaitham',
        role: 'on-field Dendro DPS',
        why: "His flexible field time and strong Spread scaling pair with Nahida's constant Dendro application.",
      },
      {
        characterKey: 'fischl',
        role: 'Electro applicator (Aggravate)',
        why: 'Steady off-field Electro application and great particles let Nahida-driven Quicken teams snowball.',
      },
      {
        characterKey: 'kuki_shinobu',
        role: 'off-field Electro + healer',
        why: 'Provides sustain alongside consistent Electro triggers for Hyperbloom.',
      },
      {
        characterKey: 'zhongli',
        role: 'universal RES shred/shield',
        why: 'Slots into nearly any Nahida team as a safe comfort pick, shredding enemy RES to boost every reaction.',
      },
    ],
    source: 'https://keqingmains.com/nahida/',
  },
  navia: {
    recs: [
      {
        characterKey: 'xilonen',
        role: 'Geo buffer/RES shredder',
        why: 'Her 4pc Scroll set grants a huge Geo DMG bonus and RES shred, appearing in nearly every Navia team.',
      },
      {
        characterKey: 'bennett',
        role: 'ATK buffer + Pyro application',
        why: "His flat ATK buff and off-field Pyro massively boost Navia's Geo Claymore damage.",
      },
      {
        characterKey: 'furina',
        role: 'Hydro buffer',
        why: 'Buffs teamwide damage and adds off-field Hydro application alongside a healer for sustain.',
      },
      {
        characterKey: 'fischl',
        role: 'off-field Electro/energy',
        why: 'Efficient off-field application and particle generation let Navia run shorter, snappier rotations.',
      },
    ],
    source: 'https://keqingmains.com/navia/',
  },
  neuvillette: {
    recs: [
      {
        characterKey: 'furina',
        role: 'Hydro Resonance buffer/DPS',
        why: "Enables Hydro Resonance for extra HP, buffs DMG, and deals real damage while lowering Neuvillette's ER needs.",
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo grouping/RES shred',
        why: "Groups enemies and applies Hydro RES shred, directly amplifying Neuvillette's hydro nukes.",
      },
      {
        characterKey: 'xilonen',
        role: 'long-duration RES shred/buffer',
        why: 'Provides sustained RES shred and a large DMG bonus via her 4pc Scroll set.',
      },
      {
        characterKey: 'zhongli',
        role: 'shield/universal RES shred',
        why: 'Offers a long, comfortable shield plus universal RES shred as a flexible defensive option.',
      },
    ],
    source: 'https://keqingmains.com/neuvillette/',
  },
  hu_tao: {
    recs: [
      {
        characterKey: 'zhongli',
        role: 'shielder/universal RES shred',
        why: 'His long-lasting shield keeps squishy Hu Tao safe while shredding enemy RES.',
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo grouper/buffer',
        why: "Groups enemies and grants an elemental DMG bonus, boosting Hu Tao's vaporize and mono-pyro damage alike.",
      },
      {
        characterKey: 'xingqiu',
        role: 'off-field Hydro application',
        why: 'Reliable Hydro application makes him "Hu Tao\'s best friend," consistently enabling vaporize.',
      },
      {
        characterKey: 'xiangling',
        role: 'off-field Pyro DPS',
        why: 'Contributes extra off-field Pyro damage and RES shred in mono-pyro compositions that skip reactions entirely.',
      },
    ],
    source: 'https://keqingmains.com/hutao/',
  },
  arataki_itto: {
    recs: [
      {
        characterKey: 'gorou',
        role: 'Geo battery/buffer',
        why: 'Generates Geo particles and buffs DEF/DMG, scaling best with a full Geo team like Itto wants.',
      },
      {
        characterKey: 'albedo',
        role: 'off-field Geo DPS',
        why: 'Provides steady off-field damage and energy generation, fitting into most mono-Geo Itto comps.',
      },
      {
        characterKey: 'zhongli',
        role: 'shielder/RES shred',
        why: 'His strong shield and RES shred keep Itto safe during his punch combos while adding Geo damage.',
      },
      {
        characterKey: 'diona',
        role: 'shield/healer/battery',
        why: 'Offers a shield, healing, and energy particles as a lighter sustain option than Zhongli.',
      },
    ],
    source: 'https://keqingmains.com/itto/',
  },
  raiden_shogun: {
    recs: [
      {
        characterKey: 'bennett',
        role: 'ATK buffer + healer',
        why: 'Delivers one of the strongest ATK buffs plus healing and Pyro application for reactions.',
      },
      {
        characterKey: 'kujou_sara',
        role: 'Electro buffer',
        why: "Buffs ATK and Electro CRIT DMG, stacking well with Raiden's own Electro-focused kit.",
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo buffer/grouper',
        why: 'Shreds RES via Viridescent Venerer and buffs Electro DMG while dealing his own Swirl/Overload damage.',
      },
      {
        characterKey: 'xiangling',
        role: 'off-field Pyro (Vaporize)',
        why: 'Her Pyronado lets Raiden-led teams trigger Vaporize for extra off-field burst damage.',
      },
    ],
    source: 'https://keqingmains.com/raiden/',
  },
  xiao: {
    recs: [
      {
        characterKey: 'faruzan',
        role: 'Anemo battery/buffer',
        why: 'Shows up in nearly every competitive Xiao team, shredding Anemo RES and cutting his energy needs.',
      },
      {
        characterKey: 'zhongli',
        role: 'shielder/RES shred',
        why: 'Keeps the plunge-attacking Xiao safe with a strong shield while adding universal RES shred.',
      },
      {
        characterKey: 'bennett',
        role: 'healer/ATK buffer',
        why: 'His heal and ATK buff sustain Xiao through the HP cost of his burst.',
      },
      {
        characterKey: 'furina',
        role: 'off-field Hydro DPS/buffer',
        why: 'Adds a second strong damage source and buffs alongside Xiao in the popular "Xiaorina" composition.',
      },
    ],
    source: 'https://keqingmains.com/xiao/',
  },
  klee: {
    recs: [
      {
        characterKey: 'bennett',
        role: 'ATK buffer + healer + battery',
        why: 'Appears in nearly every Klee team, letting her burst on demand while buffing and healing.',
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo grouper/buffer',
        why: "Groups enemies for Klee's AoE Jumpy Dumpty and boosts elemental DMG via Viridescent Venerer.",
      },
      {
        characterKey: 'furina',
        role: 'Hydro buffer',
        why: "Forms one of Klee's strongest buffer combos alongside Bennett, substantially raising her burst damage.",
      },
      {
        characterKey: 'xingqiu',
        role: 'off-field Hydro (Vaporize)',
        why: 'Enables consistent vaporized charged attacks by keeping a Hydro aura up for Klee to detonate.',
      },
    ],
    source: 'https://keqingmains.com/klee/',
  },
  tartaglia: {
    recs: [
      {
        characterKey: 'bennett',
        role: 'ATK buffer + Pyro application',
        why: 'Appears in nearly every Childe team, buffing ATK and clearing Hydro auras to enable vaporize on demand.',
      },
      {
        characterKey: 'xiangling',
        role: 'off-field Pyro (Reverse Vape)',
        why: 'Core to the highest-ceiling "reverse vape" comp, her Pyronado vaporizes Childe\'s Hydro repeatedly.',
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo grouper/buffer',
        why: "Groups enemies and shreds RES, adding swirl damage on top of Childe's ranged Hydro Bow attacks.",
      },
      {
        characterKey: 'fischl',
        role: 'off-field Electro (Electro-Charged)',
        why: "Her steady Electro application triggers Electro-Charged off of Childe's Hydro for a reaction-based alt comp.",
      },
    ],
    source: 'https://keqingmains.com/childe/',
  },
  keqing: {
    recs: [
      {
        characterKey: 'fischl',
        role: 'off-field Electro applicator (Aggravate)',
        why: "Keqing procs Aggravate off Fischl's Oz ticks while also empowering Fischl's own hits.",
      },
      {
        characterKey: 'nahida',
        role: 'Dendro applicator / EM buffer',
        why: 'Nahida keeps Quicken uptime high for Aggravate and hands Keqing a large Elemental Mastery buff.',
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo grouper/buffer',
        why: "Kazuha groups adds and adds a teamwide elemental DMG buff, amplifying Keqing's burst nuke.",
      },
      {
        characterKey: 'sucrose',
        role: 'Anemo EM support',
        why: 'Sucrose swirls for RES shred and dumps teamwide EM, stacking Aggravate damage in EM-scaling comps.',
      },
    ],
    source: 'https://keqingmains.com/keqing/',
  },
  kamisato_ayaka: {
    recs: [
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo grouper/buffer',
        why: "Kazuha pulls enemies together and buffs Cryo DMG, letting Ayaka's attacks hit a grouped pack.",
      },
      {
        characterKey: 'sangonomiya_kokomi',
        role: 'off-field Hydro applicator/healer',
        why: "Kokomi's skill drops long-lasting Hydro puddles that reliably Freeze alongside Ayaka's Cryo, while healing.",
      },
      {
        characterKey: 'shenhe',
        role: 'Cryo buffer/debuffer',
        why: 'Shenhe stacks Cryo DMG% and RES shred onto every Ayaka hit as the premier Cryo support.',
      },
      {
        characterKey: 'venti',
        role: 'Anemo grouper/CC',
        why: "Venti's burst suspends and clumps enemies in the air, letting Ayaka's attacks tag every target inside it.",
      },
    ],
    source: 'https://keqingmains.com/ayaka/',
  },
  yoimiya: {
    recs: [
      {
        characterKey: 'bennett',
        role: 'ATK buffer / healer',
        why: "Bennett's burst gives a massive flat ATK buff plus healing and self-applies Pyro.",
      },
      {
        characterKey: 'yelan',
        role: 'off-field Hydro DPS/enabler',
        why: 'Yelan layers off-field Hydro damage and a ramping DMG% buff onto Yoimiya to enable Vaporize.',
      },
      {
        characterKey: 'xingqiu',
        role: 'off-field Hydro / defensive support',
        why: 'Xingqiu adds interruption resistance and damage reduction on top of Hydro application for Vaporize.',
      },
      {
        characterKey: 'zhongli',
        role: 'shielder',
        why: "Zhongli's long-uptime shield lets Yoimiya stand and complete her normal attack strings uninterrupted.",
      },
    ],
    source: 'https://keqingmains.com/yoimiya/',
  },
  alhaitham: {
    recs: [
      {
        characterKey: 'nahida',
        role: 'Dendro battery/EM buffer',
        why: "Nahida is Alhaitham's best Dendro battery, contributing off-field damage plus a strong EM buff.",
      },
      {
        characterKey: 'furina',
        role: 'Hydro applicator (Bloom)',
        why: "Furina slots into Alhaitham's Quickbloom teams as a strong Hydro application source.",
      },
      {
        characterKey: 'zhongli',
        role: 'shielder/RES shredder',
        why: 'Zhongli brings one of the strongest shields in the game plus universal RES shred.',
      },
      {
        characterKey: 'fischl',
        role: 'off-field Electro applicator',
        why: 'Fischl applies Electro for Quicken/Aggravate/Spread, generates particles, and deals solid off-field damage.',
      },
    ],
    source: 'https://keqingmains.com/q/alhaitham-quickguide',
  },
  cyno: {
    recs: [
      {
        characterKey: 'nahida',
        role: 'Dendro applicator/EM buffer',
        why: "Nahida provides strong Dendro uptime and an EM buff, powering both Cyno's Aggravate and Quickbloom teams.",
      },
      {
        characterKey: 'yelan',
        role: 'off-field Hydro DPS',
        why: 'Yelan contributes strong personal damage and consistent Hydro application for Quickbloom teams.',
      },
      {
        characterKey: 'zhongli',
        role: 'shielder',
        why: "Zhongli's shield is the strongest in the game, giving Cyno safety to stay on-field during his burst window.",
      },
      {
        characterKey: 'kuki_shinobu',
        role: 'healer / Hyperbloom trigger',
        why: 'Kuki heals the team and can trigger additional Bloom-adjacent reactions as a flex support.',
      },
    ],
    source: 'https://keqingmains.com/q/cyno-quickguide',
  },
  wanderer: {
    recs: [
      {
        characterKey: 'faruzan',
        role: 'Anemo RES shred / buffer',
        why: 'Faruzan shreds Anemo RES and layers extra buffs tailored to Anemo DPS characters like Wanderer.',
      },
      {
        characterKey: 'bennett',
        role: 'ATK buffer / healer',
        why: "Bennett's burst gives a large flat ATK boost, heals, and applies Pyro to trigger Wanderer's swirl buff.",
      },
      {
        characterKey: 'zhongli',
        role: 'shielder / RES shredder',
        why: "Zhongli's near-unbreakable shield and universal RES shred keep Wanderer safe while he dives and plunges.",
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo grouper/buffer',
        why: "Kazuha groups enemies for Wanderer's AoE plunges and adds an elemental DMG buff on top.",
      },
    ],
    source: 'https://keqingmains.com/wanderer/',
  },
  ganyu: {
    recs: [
      {
        characterKey: 'venti',
        role: 'Anemo grouper / battery',
        why: "Venti's burst clumps enemies into the air and refunds energy, letting Ganyu's charged shots hit everything at once.",
      },
      {
        characterKey: 'bennett',
        role: 'ATK buffer / Pyro applicator',
        why: "Bennett's flat ATK buff and Pyro application make him indispensable for Ganyu's Melt charged-attack teams.",
      },
      {
        characterKey: 'xiangling',
        role: 'off-field Pyro DPS (Melt)',
        why: 'Xiangling applies Pyro fast enough that Ganyu can Melt every charged attack for massive burst windows.',
      },
      {
        characterKey: 'shenhe',
        role: 'Cryo buffer',
        why: "Shenhe is the premier Cryo buffer, boosting Ganyu's damage heavily in both Melt and Mono Cryo setups.",
      },
    ],
    source: 'https://keqingmains.com/ganyu/',
  },
  arlecchino: {
    recs: [
      {
        characterKey: 'bennett',
        role: 'ATK buffer',
        why: "Bennett's massive flat ATK buff from his burst is a top-tier damage boost for Arlecchino specifically.",
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo grouper/buffer',
        why: "Kazuha groups enemies for Arlecchino's AoE combos and adds a flexible elemental DMG% buff.",
      },
      {
        characterKey: 'zhongli',
        role: 'shielder / RES shredder',
        why: "Zhongli's long-duration shield and universal RES shred give Arlecchino durability and extra damage.",
      },
      {
        characterKey: 'xilonen',
        role: 'Geo RES shredder / buffer',
        why: 'Xilonen provides accessible RES shred and teamwide DMG bonuses as a modern Geo support pick.',
      },
    ],
    source: 'https://keqingmains.com/q/arlecchino-quickguide',
  },
  xingqiu: {
    recs: [
      {
        characterKey: 'hu_tao',
        role: 'on-field Vaporize DPS',
        why: "Hu Tao's single-target-focused attacks pair naturally with Xingqiu's consistent off-field Hydro application.",
      },
      {
        characterKey: 'bennett',
        role: 'ATK buffer',
        why: "Bennett's burst buffs whichever carry is active, making him a flexible staple alongside Xingqiu.",
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo buffer',
        why: "Kazuha groups enemies and buffs elemental DMG, spreading Xingqiu's Hydro application as AoE.",
      },
      {
        characterKey: 'yelan',
        role: 'off-field Hydro DPS',
        why: 'Pairing with Yelan doubles up off-field Hydro application and damage in Double Hydro compositions.',
      },
    ],
    source: 'https://keqingmains.com/xingqiu/',
  },
  yelan: {
    recs: [
      {
        characterKey: 'xingqiu',
        role: 'off-field Hydro application',
        why: 'Xingqiu doubles up Hydro application for Double Hydro teams and can battery Yelan.',
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo grouper/buffer',
        why: "Kazuha's buffs, RES shred, and crowd control make him one of the strongest partners for Yelan.",
      },
      {
        characterKey: 'zhongli',
        role: 'shielder / RES shredder',
        why: "Zhongli's long-uptime shield and universal RES shred meaningfully increase Yelan's overall damage and safety.",
      },
      {
        characterKey: 'hu_tao',
        role: 'on-field Vaporize DPS',
        why: "Yelan's reliable off-field Hydro application lets Hu Tao trigger Vaporize consistently as the on-field carry.",
      },
    ],
    source: 'https://keqingmains.com/yelan/',
  },
  xiangling: {
    recs: [
      {
        characterKey: 'bennett',
        role: 'battery + ATK buff',
        why: "Bennett's burst grants Xiangling a strong ATK buff, off-field healing, and enough Pyro particles to cover her energy needs.",
      },
      {
        characterKey: 'xingqiu',
        role: 'off-field Hydro application (Vaporize)',
        why: "Xingqiu's rain-sword swings apply Hydro on nearly every tick of Xiangling's Pyronado, triggering repeated Vaporize.",
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo VV shred + grouping',
        why: "Kazuha's 4pc Viridescent Venerer shreds Pyro/Hydro RES and groups enemies into Xiangling's AoE.",
      },
    ],
    source: 'https://keqingmains.com/xiangling/',
  },
  bennett: {
    recs: [
      {
        characterKey: 'xiangling',
        role: 'main Pyro sub-DPS',
        why: "Bennett's ATK buff and Pyro particle generation power Xiangling's Pyronado while his healing offsets its upkeep.",
      },
      {
        characterKey: 'xingqiu',
        role: 'off-field Hydro application',
        why: "Xingqiu keeps Hydro applied so Bennett's Pyro-infused team can vaporize consistently while also cutting incoming damage.",
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo VV shred + grouping',
        why: "Kazuha's VV shred and grouping let Bennett's buffed teammates land harder AoE hits.",
      },
      {
        characterKey: 'raiden_shogun',
        role: 'main Electro DPS (Overload/quickswap)',
        why: "Bennett's ATK buff and healing sustain Raiden through Overload-heavy quickswap rotations.",
      },
    ],
    source: 'https://keqingmains.com/bennett/',
  },
  kaedehara_kazuha: {
    recs: [
      {
        characterKey: 'xingqiu',
        role: 'off-field Hydro application',
        why: "Xingqiu's constant Hydro application lets Kazuha's swirls set up reliable Vaporize and Bloom reactions.",
      },
      {
        characterKey: 'bennett',
        role: 'ATK buff + Pyro self-aura',
        why: "Bennett's burst leaves a Pyro aura on the active character that Kazuha can swirl for extra elemental damage.",
      },
      {
        characterKey: 'fischl',
        role: 'off-field Electro application',
        why: "Fischl's Oz keeps Electro on the field for Kazuha to swirl into Aggravate or Hyperbloom triggers.",
      },
      {
        characterKey: 'nahida',
        role: 'Dendro application + amplifier',
        why: "Nahida's Dendro application combines with Kazuha's swirls to sustain Hyperbloom and Burgeon damage.",
      },
    ],
    source: 'https://keqingmains.com/kazuha/',
  },
  zhongli: {
    recs: [
      {
        characterKey: 'xingqiu',
        role: 'off-field Hydro DPS + damage reduction',
        why: "Xingqiu's Hydro application and damage-reduction buff stack with Zhongli's shield for a near-unkillable comfort team.",
      },
      {
        characterKey: 'fischl',
        role: 'off-field Electro DPS',
        why: "Zhongli's fast normal-attack strings proc Fischl's Oz frequently for steady off-field Electro damage.",
      },
      {
        characterKey: 'albedo',
        role: 'off-field Geo DPS',
        why: "Albedo's Geo construct damage and Geo Resonance pair with Zhongli's own Geo application for a tanky, hard-hitting core.",
      },
    ],
    source: 'https://keqingmains.com/zhongli/',
  },
  kuki_shinobu: {
    recs: [
      {
        characterKey: 'cyno',
        role: 'main Electro DPS (Hyperbloom)',
        why: "Cyno hits hard on-field without consuming much of the Hyperbloom shatter that Shinobu's fast Electro application sets up.",
      },
      {
        characterKey: 'fischl',
        role: 'off-field Electro DPS (Hyperbloom)',
        why: "Fischl's frequent procs stack with Shinobu's own application to keep Hyperbloom cores popping.",
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo VV shred + grouping',
        why: "Kazuha's VV shred and grouping boost the team's elemental damage while Shinobu focuses on healing.",
      },
      {
        characterKey: 'zhongli',
        role: 'shielder',
        why: "Zhongli's shield covers survivability so Shinobu can be run purely as a healer/Electro applicator.",
      },
    ],
    source: 'https://keqingmains.com/q/shinobu-quickguide/',
  },
  faruzan: {
    recs: [
      {
        characterKey: 'wanderer',
        role: 'main Anemo on-field DPS',
        why: "Faruzan's Anemo DMG% buff and RES shred amplify Wanderer's on-field nuke rotations.",
      },
      {
        characterKey: 'xiao',
        role: 'main Anemo on-field DPS',
        why: "Xiao benefits directly from Faruzan's Anemo damage buff and RES shred during his burst-locked jump combos.",
      },
      {
        characterKey: 'zhongli',
        role: 'shielder',
        why: "Zhongli's shield keeps the on-field Anemo DPS safe while adding further RES shred alongside Faruzan's.",
      },
      {
        characterKey: 'fischl',
        role: 'off-field Electro DPS (Thundering Fury)',
        why: "Fischl keeps Electro reliably applied so Faruzan's Thundering Fury teams sustain their reaction triggers.",
      },
    ],
    source: 'https://keqingmains.com/faruzan/',
  },
  sigewinne: {
    recs: [
      {
        characterKey: 'furina',
        role: 'main Hydro DPS',
        why: "Sigewinne's healing stacks Furina's Fanfare, and Furina's high DMG bonus and CRIT make her the best user of Sigewinne's A1 buff.",
      },
      {
        characterKey: 'fischl',
        role: 'off-field Electro DPS (Hyperbloom)',
        why: "Fischl efficiently spends Sigewinne's A1 buff through her Skill and passive hits while powering Hyperbloom teams.",
      },
      {
        characterKey: 'yae_miko',
        role: 'off-field Electro DPS (Electro-Charged)',
        why: "Yae Miko's frequent totem hits make good use of Sigewinne's A1 buff in Electro-Charged compositions.",
      },
      {
        characterKey: 'nilou',
        role: 'main Hydro DPS (Bloom)',
        why: "Sigewinne's healing offsets the self-damage from Bloom cores, keeping Nilou's Bloom team stable.",
      },
    ],
    source: 'https://keqingmains.com/q/sigewinne-quickguide',
  },
  kujou_sara: {
    recs: [
      {
        characterKey: 'raiden_shogun',
        role: 'main Electro DPS',
        why: "Raiden reduces Sara's energy needs while reaping huge value from Sara's ATK and CRIT DMG buffs during her burst nuke.",
      },
      {
        characterKey: 'fischl',
        role: 'off-field Electro DPS',
        why: "Fischl's off-field hits can snapshot Sara's stacked buffs for strong sustained single-target damage.",
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo VV shred + grouping',
        why: "Kazuha's VV shred and grouping stack with Sara's ATK/CRIT DMG buffs to raise the whole team's elemental damage.",
      },
    ],
    source: 'https://keqingmains.com/sara/',
  },
  wriothesley: {
    recs: [
      {
        characterKey: 'zhongli',
        role: 'shielder',
        why: "Zhongli's shield and universal RES shred make Wriothesley's melee combo strings both safer and harder-hitting.",
      },
      {
        characterKey: 'bennett',
        role: 'ATK buff + healer',
        why: "Bennett's ATK buff and healing are treated as near-mandatory for Wriothesley's Reverse Melt teams.",
      },
      {
        characterKey: 'shenhe',
        role: 'Cryo buffer',
        why: "Shenhe's Cryo DMG%, Normal/Charged Attack buffs, and Cryo RES shred directly power Wriothesley's attack-based kit.",
      },
      {
        characterKey: 'xiangling',
        role: 'off-field Pyro application (Reverse Melt)',
        why: "Xiangling's long-lasting Pyro application lets Wriothesley trigger Reverse Melt on nearly every hit.",
      },
    ],
    source: 'https://keqingmains.com/q/wriothesley-quickguide/',
  },
  clorinde: {
    recs: [
      {
        characterKey: 'chevreuse',
        role: 'Overload enabler',
        why: "Chevreuse shreds enemy RES and grants ATK on Overload, unlocking Clorinde's Overload-focused teams.",
      },
      {
        characterKey: 'fischl',
        role: 'off-field Electro DPS',
        why: "Fischl's personal damage, off-field Electro application, and particle generation make her an efficient teammate for Clorinde.",
      },
      {
        characterKey: 'kaedehara_kazuha',
        role: 'Anemo VV shred + grouping',
        why: "Kazuha's buffs and grouping make him Clorinde's best Anemo teammate for both single-target and AoE setups.",
      },
      {
        characterKey: 'nahida',
        role: 'Dendro application (Quicken)',
        why: "Nahida keeps Dendro applied to sustain Quicken uptime, making her Clorinde's premier partner in Quicken teams.",
      },
    ],
    source: 'https://keqingmains.com/q/clorinde-quickguide/',
  },
};

/** Resolve a teammate's display name, falling back to the raw key rather than
 *  crashing when the dataset doesn't have them (e.g. a very new character). */
export function resolveTeammateName(
  characterKey: string,
  characters: { key: string; name: string }[],
): string {
  return characters.find((c) => c.key === characterKey)?.name ?? characterKey;
}
