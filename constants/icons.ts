import planer from '../public/assets/planer.svg';
import modul from '../public/assets/modul.svg';
import fortschritt from '../public/assets/fortschritt.svg';
import settings from '../public/assets/einstellungen.svg';

export const icons = {
    planer,
    modul,
    fortschritt,
    settings
} as const;

export type IconKey = keyof typeof icons;