"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

import { nextFreeLocation } from "@/lib/cloakroom";
import {
  DEFAULT_SETTINGS,
  DEMO_CUSTOMERS,
  DEMO_DEPOSITS,
  DEMO_INCIDENTS,
  VENUE,
} from "@/lib/demo-data";
import { demoNow, formatLocation } from "@/lib/format";
import type {
  AppSettings,
  Customer,
  Deposit,
  DepositItem,
  Incident,
  IncidentStatus,
  IncidentType,
  TicketChannel,
} from "@/lib/types";

const STORAGE_KEY = "vestia.demo.v2";

export interface VestiaState {
  deposits: Deposit[];
  customers: Customer[];
  incidents: Incident[];
  settings: AppSettings;
  nextTicket: number;
  nextIncident: number;
}

function initialState(): VestiaState {
  const lastTicket = DEMO_DEPOSITS.reduce(
    (max, deposit) => Math.max(max, Number(deposit.id.slice(2))),
    0,
  );
  const lastIncident = DEMO_INCIDENTS.reduce(
    (max, incident) => Math.max(max, Number(incident.id.slice(4))),
    0,
  );
  return {
    deposits: DEMO_DEPOSITS,
    customers: DEMO_CUSTOMERS,
    incidents: DEMO_INCIDENTS,
    settings: DEFAULT_SETTINGS,
    nextTicket: lastTicket + 1,
    nextIncident: lastIncident + 1,
  };
}

type Action =
  | { type: "hydrate"; state: VestiaState }
  | { type: "create-deposit"; deposit: Deposit; customer: Customer | null }
  | { type: "return-deposit"; id: string; at: string }
  | { type: "send-ticket"; id: string; channel: TicketChannel; at: string }
  | { type: "create-incident"; incident: Incident }
  | { type: "set-incident-status"; id: string; status: IncidentStatus; at: string }
  | { type: "update-settings"; patch: Partial<AppSettings> }
  | { type: "reset" };

const CHANNEL_LABELS: Record<TicketChannel, string> = {
  qr: "QR code",
  sms: "SMS",
  whatsapp: "WhatsApp",
  email: "E-mail",
  wallet: "Wallet",
};

function reducer(state: VestiaState, action: Action): VestiaState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "create-deposit":
      return {
        ...state,
        deposits: [...state.deposits, action.deposit],
        customers: action.customer
          ? [...state.customers, action.customer]
          : state.customers,
        nextTicket: state.nextTicket + 1,
      };

    case "return-deposit":
      return {
        ...state,
        deposits: state.deposits.map((deposit) =>
          deposit.id === action.id && deposit.status !== "returned"
            ? {
                ...deposit,
                status: "returned",
                returnedAt: action.at,
                timeline: [
                  ...deposit.timeline,
                  {
                    at: action.at,
                    kind: "returned" as const,
                    label: "Affaires restituées",
                    detail: "Scan validé au vestiaire",
                  },
                ],
              }
            : deposit,
        ),
      };

    case "send-ticket":
      return {
        ...state,
        deposits: state.deposits.map((deposit) =>
          deposit.id === action.id
            ? {
                ...deposit,
                channels: deposit.channels.includes(action.channel)
                  ? deposit.channels
                  : [...deposit.channels, action.channel],
                timeline: [
                  ...deposit.timeline,
                  {
                    at: action.at,
                    kind: "sent" as const,
                    label: "Ticket envoyé",
                    detail: CHANNEL_LABELS[action.channel],
                  },
                ],
              }
            : deposit,
        ),
      };

    case "create-incident":
      return {
        ...state,
        incidents: [action.incident, ...state.incidents],
        nextIncident: state.nextIncident + 1,
        deposits: action.incident.depositId
          ? state.deposits.map((deposit) =>
              deposit.id === action.incident.depositId &&
              deposit.status === "active"
                ? { ...deposit, status: "incident" }
                : deposit,
            )
          : state.deposits,
      };

    case "set-incident-status": {
      const target = state.incidents.find(
        (incident) => incident.id === action.id,
      );
      const incidents = state.incidents.map((incident) =>
        incident.id === action.id
          ? {
              ...incident,
              status: action.status,
              resolvedAt: action.status === "resolved" ? action.at : undefined,
            }
          : incident,
      );
      // Un incident résolu rend son dépôt à l'état actif.
      const deposits =
        action.status === "resolved" && target?.depositId
          ? state.deposits.map((deposit) =>
              deposit.id === target.depositId && deposit.status === "incident"
                ? { ...deposit, status: "active" as const }
                : deposit,
            )
          : state.deposits;
      return { ...state, incidents, deposits };
    }

    case "update-settings":
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case "reset":
      return initialState();

    default:
      return state;
  }
}

export interface CreateDepositInput {
  items: DepositItem[];
  customerName: string;
  customerPhone: string;
  channels: TicketChannel[];
}

interface VestiaContextValue {
  state: VestiaState;
  venue: typeof VENUE;
  /** `false` tant que l'état persisté n'a pas été relu (évite tout flash). */
  ready: boolean;
  createDeposit: (input: CreateDepositInput) => Deposit | null;
  returnDeposit: (id: string) => void;
  sendTicket: (id: string, channel: TicketChannel) => void;
  createIncident: (input: {
    type: IncidentType;
    title: string;
    description: string;
    depositId?: string;
  }) => Incident;
  setIncidentStatus: (id: string, status: IncidentStatus) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetDemo: () => void;
}

const VestiaContext = createContext<VestiaContextValue | null>(null);

export function VestiaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [ready, setReady] = useState(false);

  // Relecture de l'état persisté : après le montage uniquement, pour que le
  // HTML rendu côté serveur et côté client soient strictement identiques.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as VestiaState;
        if (Array.isArray(parsed.deposits) && parsed.deposits.length > 0) {
          dispatch({ type: "hydrate", state: parsed });
        }
      }
    } catch {
      // Stockage indisponible (navigation privée) : on garde le jeu de démo.
    }
    // La lecture du stockage de session est une synchronisation avec un
    // système externe, faite une seule fois après le montage : c'est
    // exactement le cas que cette règle autorise en pratique.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota ou stockage désactivé : la démo fonctionne quand même.
    }
  }, [state, ready]);

  const createDeposit = useCallback(
    (input: CreateDepositInput): Deposit | null => {
      const location = nextFreeLocation(VENUE, state.deposits);
      if (!location) return null;

      const at = demoNow();
      const id = `${state.settings.ticketPrefix}-${state.nextTicket}`;
      const phone = input.customerPhone.replace(/\s/g, "");
      const existing = state.customers.find(
        (customer) => phone.length > 0 && customer.phone === phone,
      );
      const customer: Customer | null = existing
        ? null
        : {
            id: `C-${state.nextTicket}`,
            name: input.customerName.trim() || "Client sans nom",
            phone,
            since: at,
            vip: false,
          };

      const deposit: Deposit = {
        id,
        customerId: existing ? existing.id : (customer as Customer).id,
        items: input.items,
        location,
        depositedAt: at,
        status: "active",
        staff: "Maya",
        channels: input.channels.length > 0 ? input.channels : ["qr"],
        timeline: [
          { at, kind: "created", label: "Dépôt créé", detail: "Enregistré par Maya" },
          {
            at,
            kind: "assigned",
            label: "Emplacement attribué",
            detail: formatLocation(location),
          },
        ],
      };

      dispatch({ type: "create-deposit", deposit, customer });
      return deposit;
    },
    [state.customers, state.deposits, state.nextTicket, state.settings.ticketPrefix],
  );

  const returnDeposit = useCallback((id: string) => {
    dispatch({ type: "return-deposit", id, at: demoNow() });
  }, []);

  const sendTicket = useCallback((id: string, channel: TicketChannel) => {
    dispatch({ type: "send-ticket", id, channel, at: demoNow() });
  }, []);

  const createIncident = useCallback(
    (input: {
      type: IncidentType;
      title: string;
      description: string;
      depositId?: string;
    }): Incident => {
      const incident: Incident = {
        id: `INC-${String(state.nextIncident).padStart(3, "0")}`,
        type: input.type,
        status: "open",
        title: input.title,
        description: input.description,
        depositId: input.depositId,
        createdAt: demoNow(),
        assignee: "Maya",
      };
      dispatch({ type: "create-incident", incident });
      return incident;
    },
    [state.nextIncident],
  );

  const setIncidentStatus = useCallback(
    (id: string, status: IncidentStatus) => {
      dispatch({ type: "set-incident-status", id, status, at: demoNow() });
    },
    [],
  );

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    dispatch({ type: "update-settings", patch });
  }, []);

  const resetDemo = useCallback(() => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Rien à nettoyer.
    }
    dispatch({ type: "reset" });
  }, []);

  const value = useMemo<VestiaContextValue>(
    () => ({
      state,
      venue: VENUE,
      ready,
      createDeposit,
      returnDeposit,
      sendTicket,
      createIncident,
      setIncidentStatus,
      updateSettings,
      resetDemo,
    }),
    [
      state,
      ready,
      createDeposit,
      returnDeposit,
      sendTicket,
      createIncident,
      setIncidentStatus,
      updateSettings,
      resetDemo,
    ],
  );

  return (
    <VestiaContext.Provider value={value}>{children}</VestiaContext.Provider>
  );
}

export function useVestia(): VestiaContextValue {
  const context = useContext(VestiaContext);
  if (!context) {
    throw new Error("useVestia doit être utilisé dans un <VestiaProvider>.");
  }
  return context;
}

/** Retrouve un dépôt par identifiant, insensible à la casse et au préfixe. */
export function findDeposit(
  deposits: Deposit[],
  query: string,
): Deposit | undefined {
  const needle = query.trim().toUpperCase().replace(/\s/g, "");
  if (!needle) return undefined;
  return (
    deposits.find((deposit) => deposit.id.toUpperCase() === needle) ??
    deposits.find(
      (deposit) => deposit.id.toUpperCase().replace("-", "") === needle.replace("-", ""),
    ) ??
    deposits.find((deposit) => deposit.id.slice(2) === needle)
  );
}
