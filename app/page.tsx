"use client";

import { useMemo, useState } from "react";

type TacticId = "goblinTempo" | "assassinDive" | "econDeny";
type StarLevel = 1 | 2 | 3 | 4;

type Unit = {
  name: string;
  traits: [string, string];
  elixir: number;
  role: "Frontline" | "Backline" | "Utility";
  notes: string;
};

type NodeRecommendation = {
  unit: string;
  score: number;
  reason: string;
};

type TacticTree = {
  id: TacticId;
  name: string;
  description: string;
  roots: string[];
  recommendations: Record<string, NodeRecommendation[]>;
};

const UNITS: Unit[] = [
  { name: "Bandit", traits: ["Assassin", "Ace"], elixir: 3, role: "Utility", notes: "Jumps onto fragile backline targets." },
  { name: "Executioner", traits: ["Assassin", "Blaster"], elixir: 3, role: "Backline", notes: "AoE ranged pressure in dive comps." },
  { name: "Mega Knight", traits: ["Assassin", "Brutalist"], elixir: 4, role: "Frontline", notes: "Heavy disruption and stall tank." },
  { name: "Monk", traits: ["Assassin", "Superstar"], elixir: 4, role: "Frontline", notes: "Durable anti-projectile bruiser." },
  { name: "Wizard", traits: ["Clan", "Blaster"], elixir: 3, role: "Backline", notes: "Reliable AoE blaster damage." },
  { name: "Barbarians", traits: ["Clan", "Brawler"], elixir: 2, role: "Frontline", notes: "Cheap early frontline body." },
  { name: "Valkyrie", traits: ["Clan", "Brutalist"], elixir: 3, role: "Frontline", notes: "Strong anti-swarm frontliner." },
  { name: "Archer Queen", traits: ["Clan", "Superstar"], elixir: 4, role: "Backline", notes: "Top-end carry when protected." },
  { name: "Royal Giant", traits: ["Giant", "Ranger"], elixir: 4, role: "Backline", notes: "Long-range giant trait carry." },
  { name: "Electro Giant", traits: ["Giant", "Superstar"], elixir: 4, role: "Frontline", notes: "Punishes high hit-speed enemies." },
  { name: "Goblins", traits: ["Goblin", "Assassin"], elixir: 2, role: "Utility", notes: "Fast starter and merge-friendly." },
  { name: "Spear Goblins", traits: ["Goblin", "Blaster"], elixir: 2, role: "Backline", notes: "Cheap ranged pressure." },
  { name: "Goblin Machine", traits: ["Goblin", "Brutalist"], elixir: 4, role: "Frontline", notes: "Scales hard with stars." },
  { name: "Dart Goblin", traits: ["Goblin", "Ranger"], elixir: 3, role: "Backline", notes: "Rapid poke damage from safety." },
  { name: "PEKKA", traits: ["P.E.K.K.A", "Brawler"], elixir: 4, role: "Frontline", notes: "High-cost late-game closer." },
  { name: "Mini PEKKA", traits: ["P.E.K.K.A", "Brutalist"], elixir: 3, role: "Frontline", notes: "Efficient single-target burst." },
  { name: "Golden Knight", traits: ["Noble", "Assassin"], elixir: 4, role: "Utility", notes: "Dash resets can swing rounds." },
  { name: "Princess", traits: ["Noble", "Blaster"], elixir: 3, role: "Backline", notes: "Safe long-range splash pressure." },
  { name: "Prince", traits: ["Noble", "Brawler"], elixir: 3, role: "Frontline", notes: "Single-target breaker." },
  { name: "Musketeer", traits: ["Noble", "Superstar"], elixir: 3, role: "Backline", notes: "Reliable ranged DPS." },
  { name: "Royal Ghost", traits: ["Undead", "Assassin"], elixir: 3, role: "Utility", notes: "Stealth backline threat." },
  { name: "Skeleton King", traits: ["Undead", "Brutalist"], elixir: 4, role: "Frontline", notes: "Sustained frontline with summon pressure." },
  { name: "Skeleton Dragons", traits: ["Undead", "Ranger"], elixir: 2, role: "Backline", notes: "Wide-area ranged burn pressure." },
  { name: "Witch", traits: ["Undead", "Superstar"], elixir: 3, role: "Backline", notes: "Summons pressure and sustain." },
];

const TACTIC_TREES: TacticTree[] = [
  {
    id: "goblinTempo",
    name: "Goblin Tempo",
    description:
      "Beginner-friendly route: prioritize Goblin trait breakpoints, then add a stable front line and premium carry.",
    roots: ["Goblins", "Spear Goblins"],
    recommendations: {
      Goblins: [
        { unit: "Spear Goblins", score: 97, reason: "Fastest path to Goblin(2) spike and cheap merges." },
        { unit: "Goblin Machine", score: 92, reason: "Adds scaling frontline while keeping Goblin synergy live." },
      ],
      "Spear Goblins": [
        { unit: "Goblins", score: 95, reason: "Completes Goblin core and improves merge consistency." },
        { unit: "Goblin Machine", score: 90, reason: "Converts tempo into real frontline durability." },
      ],
      "Goblin Machine": [
        { unit: "Valkyrie", score: 85, reason: "Covers anti-swarm and secures a safer front line." },
        { unit: "Archer Queen", score: 82, reason: "Adds high-ceiling late-game carry behind your tanks." },
      ],
      Valkyrie: [
        { unit: "Archer Queen", score: 88, reason: "Strong protected carry once frontline is stable." },
        { unit: "Prince", score: 80, reason: "Better single-target pressure vs tank-heavy lobbies." },
      ],
    },
  },
  {
    id: "assassinDive",
    name: "Assassin Backline Dive",
    description:
      "Counter Ranger/Blaster-heavy lobbies by chaining Assassin jump threats and rounding out with utility DPS.",
    roots: ["Bandit", "Royal Ghost"],
    recommendations: {
      Bandit: [
        { unit: "Royal Ghost", score: 96, reason: "Immediate Assassin(2) pressure into backline comps." },
        { unit: "Mega Knight", score: 91, reason: "Adds frontline disruption for sustained dive access." },
      ],
      "Royal Ghost": [
        { unit: "Bandit", score: 95, reason: "Most consistent way to secure Assassin breakpoint early." },
        { unit: "Mega Knight", score: 89, reason: "Lets assassins survive long enough to cycle jumps." },
      ],
      "Mega Knight": [
        { unit: "Musketeer", score: 84, reason: "Reliable cleanup DPS while assassins split enemy backline." },
        { unit: "Witch", score: 79, reason: "Summons create chaos and draw aggro away from divers." },
      ],
      Musketeer: [{ unit: "Archer Queen", score: 83, reason: "Upside carry to close rounds when dives connect." }],
    },
  },
  {
    id: "econDeny",
    name: "Economy & Denial",
    description:
      "Built for shared-pool manipulation: buy contested units, merge for value, and pivot to strong standalone threats.",
    roots: ["Prince", "PEKKA"],
    recommendations: {
      Prince: [
        { unit: "PEKKA", score: 94, reason: "Strong denial pair that also gives a legitimate carry shell." },
        { unit: "Musketeer", score: 87, reason: "Low-risk DPS while you hold/deny contested shop units." },
      ],
      PEKKA: [
        { unit: "Prince", score: 92, reason: "Improves single-target breakpoints and pressure on tanks." },
        { unit: "Witch", score: 84, reason: "Summons buy time while you play economy cycles." },
      ],
      Musketeer: [{ unit: "Valkyrie", score: 80, reason: "Cheap stabilization line when econ path is under pressure." }],
      Witch: [{ unit: "Archer Queen", score: 78, reason: "High cap pivot after stabilizing economy." }],
    },
  },
];

function getUnit(name: string) {
  return UNITS.find((unit) => unit.name === name);
}

export default function Home() {
  const [selectedTactic, setSelectedTactic] = useState<TacticId>("goblinTempo");
  const [rosterStars, setRosterStars] = useState<Record<string, StarLevel>>({});

  const tactic = useMemo(
    () => TACTIC_TREES.find((tree) => tree.id === selectedTactic) ?? TACTIC_TREES[0],
    [selectedTactic],
  );

  const roster = useMemo(() => Object.keys(rosterStars), [rosterStars]);
  const rosterSet = useMemo(() => new Set(roster), [roster]);

  const suggestions = useMemo(() => {
    const pool = new Map<string, NodeRecommendation & { parent: string }>();

    for (const currentUnit of roster) {
      for (const rec of tactic.recommendations[currentUnit] ?? []) {
        if (rosterSet.has(rec.unit)) continue;
        const prev = pool.get(rec.unit);
        if (!prev || rec.score > prev.score) {
          pool.set(rec.unit, { ...rec, parent: currentUnit });
        }
      }
    }

    if (pool.size === 0) {
      for (const rootUnit of tactic.roots) {
        if (!rosterSet.has(rootUnit)) {
          pool.set(rootUnit, {
            unit: rootUnit,
            score: 99,
            reason: "Best opening node for this tactic tree.",
            parent: "root",
          });
        }
      }
    }

    return [...pool.values()].sort((a, b) => b.score - a.score).slice(0, 4);
  }, [roster, rosterSet, tactic]);

  const toggleUnit = (name: string) => {
    setRosterStars((previous) => {
      if (previous[name]) {
        const next = { ...previous };
        delete next[name];
        return next;
      }
      return { ...previous, [name]: 1 };
    });
  };

  const setStarLevel = (name: string, direction: "up" | "down") => {
    setRosterStars((previous) => {
      const current = previous[name] ?? 1;
      const nextLevel =
        direction === "up" ? Math.min(4, current + 1) : Math.max(1, current - 1);
      return { ...previous, [name]: nextLevel as StarLevel };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold">Merge Tactics Next-Pick Helper</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Pick your current roster and strategy focus. The helper traverses a tactic tree and suggests the
          highest-value children from your current nodes.
        </p>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold">1) Choose optimization tactic</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {TACTIC_TREES.map((tree) => (
              <button
                key={tree.id}
                onClick={() => setSelectedTactic(tree.id)}
                className={`rounded-lg border p-4 text-left transition ${
                  selectedTactic === tree.id
                    ? "border-emerald-400 bg-emerald-400/10"
                    : "border-slate-700 hover:border-slate-500"
                }`}
              >
                <p className="font-medium">{tree.name}</p>
                <p className="mt-2 text-sm text-slate-300">{tree.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold">2) Troop catalog + current roster stars</h2>
          <p className="mt-1 text-sm text-slate-400">
            Tap a troop to add/remove it from your roster. For selected troops, use + / - to track merges up to 4★.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {UNITS.map((unit) => {
              const selected = Boolean(rosterStars[unit.name]);
              const stars = rosterStars[unit.name] ?? 1;
              return (
                <button
                  key={unit.name}
                  onClick={() => toggleUnit(unit.name)}
                  className={`rounded-lg border p-3 text-left transition ${
                    selected ? "border-cyan-400 bg-cyan-400/10" : "border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{unit.name}</p>
                    <span className="text-xs text-slate-400">{unit.elixir} Elixir</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Traits: {unit.traits.join(" + ")}</p>
                  <p className="mt-2 text-xs text-slate-400">Role: {unit.role}</p>
                  <p className="mt-2 text-sm text-slate-300">{unit.notes}</p>
                  {selected ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">{stars}★</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setStarLevel(unit.name, "down");
                        }}
                        className="rounded border border-slate-600 px-2 py-1 text-xs hover:border-slate-400"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setStarLevel(unit.name, "up");
                        }}
                        className="rounded border border-slate-600 px-2 py-1 text-xs hover:border-slate-400"
                      >
                        +
                      </button>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold">3) Best next unit options</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {suggestions.map((choice) => {
              const unit = getUnit(choice.unit);
              return (
                <article key={choice.unit} className="rounded-lg border border-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">{choice.unit}</p>
                    <span className="rounded bg-emerald-500/20 px-2 py-1 text-sm text-emerald-300">
                      Score {choice.score}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{choice.reason}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Source node: {choice.parent} • Traits: {unit?.traits.join(" + ") ?? "Unknown"} • Cost: {unit?.elixir ?? "?"} elixir
                  </p>
                </article>
              );
            })}
          </div>
          {suggestions.length === 0 ? (
            <p className="mt-3 text-sm text-amber-300">No suggestions available for this state yet.</p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
