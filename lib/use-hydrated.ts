"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` pendant le rendu serveur et au premier rendu client, `true` ensuite.
 *
 * C'est le moyen recommandé de différer un rendu qui dépend du navigateur
 * (portail, mesure de taille, `window.location`) sans provoquer d'écart
 * d'hydratation — et sans appeler `setState` depuis un effet.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
