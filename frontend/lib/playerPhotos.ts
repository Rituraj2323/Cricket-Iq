// Cricket player photos using Wikipedia/Wikimedia Commons (no hotlink protection)
// and ESPN Cricinfo for legends. Falls back to DiceBear generated avatars.

export const PLAYER_PHOTOS: Record<string, string> = {
  // India — Wikipedia Commons
  virat_kohli:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Virat_Kohli_framed.png/220px-Virat_Kohli_framed.png',
  rohit_sharma:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Rohit_Sharma_2019.jpg/220px-Rohit_Sharma_2019.jpg',
  ms_dhoni:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/MS_Dhoni_in_2019.jpg/220px-MS_Dhoni_in_2019.jpg',
  jasprit_bumrah:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Jasprit_Bumrah_2022.jpg/220px-Jasprit_Bumrah_2022.jpg',
  hardik_pandya:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Hardik_Pandya_2022.jpg/220px-Hardik_Pandya_2022.jpg',
  suryakumar_yadav:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/SKY2022.jpeg/220px-SKY2022.jpeg',
  ravindra_jadeja:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Ravindra_Jadeja_2019.jpg/220px-Ravindra_Jadeja_2019.jpg',
  kl_rahul:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/KL_Rahul_2022.jpg/220px-KL_Rahul_2022.jpg',
  shubman_gill:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Shubman_Gill_2023.jpg/220px-Shubman_Gill_2023.jpg',
  yashasvi_jaiswal:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Yashasvi_Jaiswal_%28cropped%29.jpg/220px-Yashasvi_Jaiswal_%28cropped%29.jpg',
  mohammed_shami:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Mohammed_Shami_%28cropped%29.jpg/220px-Mohammed_Shami_%28cropped%29.jpg',
  ravichandran_ashwin:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Ravichandran_Ashwin_2016.jpg/220px-Ravichandran_Ashwin_2016.jpg',
  rishabh_pant:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Rishabh_Pant_2022.jpg/220px-Rishabh_Pant_2022.jpg',
  kuldeep_yadav:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Kuldeep_Yadav_2018.jpg/220px-Kuldeep_Yadav_2018.jpg',
  sachin_tendulkar:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Sachin_Tendulkar.jpg/220px-Sachin_Tendulkar.jpg',
  virender_sehwag:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Virender_Sehwag_-_2010.jpg/220px-Virender_Sehwag_-_2010.jpg',
  yuvraj_singh:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Yuvraj_singh.jpg/220px-Yuvraj_singh.jpg',

  // Australia — Wikipedia Commons
  travis_head:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Travis_Head_2023.jpg/220px-Travis_Head_2023.jpg',
  pat_cummins:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Pat_Cummins_2022.jpg/220px-Pat_Cummins_2022.jpg',
  david_warner:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/David_Warner_2015-03-15_001.jpg/220px-David_Warner_2015-03-15_001.jpg',
  steve_smith:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Steve_Smith_2019.jpg/220px-Steve_Smith_2019.jpg',
  mitchell_starc:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Mitchell_Starc_2015.jpg/220px-Mitchell_Starc_2015.jpg',
  glenn_maxwell:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Glenn_Maxwell.jpg/220px-Glenn_Maxwell.jpg',

  // England — Wikipedia Commons
  jos_buttler:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jos_Buttler_2021.jpg/220px-Jos_Buttler_2021.jpg',
  joe_root:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Joe_Root_2022.jpg/220px-Joe_Root_2022.jpg',
  ben_stokes:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Ben_Stokes_2022.jpg/220px-Ben_Stokes_2022.jpg',

  // South Africa — Wikipedia Commons
  heinrich_klaasen:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Heinrich_Klaasen.jpg/220px-Heinrich_Klaasen.jpg',
  kagiso_rabada:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Kagiso_Rabada_2016.jpg/220px-Kagiso_Rabada_2016.jpg',
  david_miller:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/David_Miller_Cricketer.jpg/220px-David_Miller_Cricketer.jpg',
  ab_de_villiers:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/AB_de_Villiers.jpg/220px-AB_de_Villiers.jpg',
  faf_du_plessis:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Faf_du_Plessis_2016.jpg/220px-Faf_du_Plessis_2016.jpg',
  dale_steyn:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Dale_Steyn_2016.jpg/220px-Dale_Steyn_2016.jpg',

  // Pakistan — Wikipedia Commons
  babar_azam:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Babar_Azam_2021.jpg/220px-Babar_Azam_2021.jpg',
  mohammad_rizwan:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Mohammad_Rizwan_2022.jpg/220px-Mohammad_Rizwan_2022.jpg',
  shaheen_afridi:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Shaheen_Shah_Afridi_2022.jpg/220px-Shaheen_Shah_Afridi_2022.jpg',

  // New Zealand — Wikipedia Commons
  kane_williamson:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Kane_Williamson_2019.jpg/220px-Kane_Williamson_2019.jpg',
  trent_boult:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Trent_Boult_2015.jpg/220px-Trent_Boult_2015.jpg',

  // West Indies — Wikipedia Commons
  nicholas_pooran:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Nicholas_Pooran_2022.jpg/220px-Nicholas_Pooran_2022.jpg',
  andre_russell:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Andre_Russell_2019.jpg/220px-Andre_Russell_2019.jpg',
  sunil_narine:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Sunil_Narine_2019.jpg/220px-Sunil_Narine_2019.jpg',
  chris_gayle:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Chris_Gayle_2019.jpg/220px-Chris_Gayle_2019.jpg',

  // Afghanistan — Wikipedia Commons
  rashid_khan:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Rashid_Khan_2022.jpg/220px-Rashid_Khan_2022.jpg',

  // Sri Lanka — Wikipedia Commons
  wanindu_hasaranga:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Wanindu_Hasaranga_2022.jpg/220px-Wanindu_Hasaranga_2022.jpg',
  lasith_malinga:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Lasith_Malinga_2019.jpg/220px-Lasith_Malinga_2019.jpg',

  // Bangladesh
  shakib_al_hasan:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Shakib_Al_Hasan_2022.jpg/220px-Shakib_Al_Hasan_2022.jpg',
};

// Country-specific background colors for avatars
const COUNTRY_BG: Record<string, string> = {
  India: '1a56db',         // blue
  Australia: 'f59e0b',     // gold
  England: '0ea5e9',       // sky blue
  Pakistan: '16a34a',      // green
  'South Africa': '1d4ed8', // dark blue
  'New Zealand': '0f172a', // black
  'West Indies': 'b91c1c', // maroon
  Afghanistan: '166534',   // dark green
  'Sri Lanka': '1e40af',   // blue
  Bangladesh: '15803d',    // green
  Zimbabwe: 'b45309',      // amber
  USA: '1e3a8a',           // dark blue
};

/**
 * Returns a reliable photo URL for a player.
 * Falls back to a DiceBear avatar if no photo is mapped.
 */
export function getPlayerPhoto(playerId: string, playerName?: string, country?: string): string {
  if (PLAYER_PHOTOS[playerId]) {
    return PLAYER_PHOTOS[playerId];
  }

  // High-quality DiceBear avatar fallback
  const bg = COUNTRY_BG[country || ''] || '0d5c63';
  const seed = encodeURIComponent(playerName || playerId);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=${bg}&fontWeight=800&textColor=ffffff&fontSize=38&chars=2`;
}

/**
 * Handles broken img src — returns DiceBear fallback URL
 */
export function getAvatarFallback(playerName: string, country?: string): string {
  const bg = COUNTRY_BG[country || ''] || '0d5c63';
  const seed = encodeURIComponent(playerName);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=${bg}&fontWeight=800&textColor=ffffff&fontSize=38&chars=2`;
}

export const COUNTRY_FLAGS: Record<string, string> = {
  India: '🇮🇳',
  Australia: '🇦🇺',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Pakistan: '🇵🇰',
  'South Africa': '🇿🇦',
  'New Zealand': '🇳🇿',
  'West Indies': '🏝️',
  Afghanistan: '🇦🇫',
  'Sri Lanka': '🇱🇰',
  Bangladesh: '🇧🇩',
  Zimbabwe: '🇿🇼',
  USA: '🇺🇸',
  Ireland: '🇮🇪',
  Netherlands: '🇳🇱',
};

export function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country] || '🌍';
}
