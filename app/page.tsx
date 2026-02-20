"use client";

import { useMemo, useState } from "react";

type TacticId = "goblinTempo" | "assassinDive" | "econDeny";

type Unit = {
  name: string;
  traits: [string, string];
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
  { name: "Goblins", traits: ["Goblin", "Ace"], role: "Utility", notes: "Fast starter and merge-friendly." },
  { name: "Spear Goblins", traits: ["Goblin", "Blaster"], role: "Backline", notes: "Cheap ranged pressure." },
  { name: "Goblin Machine", traits: ["Goblin", "Brutalist"], role: "Frontline", notes: "Scales hard with stars." },
  { name: "Bandit", traits: ["Assassin", "Ace"], role: "Utility", notes: "Jumps to fragile backline units." },
  { name: "Mega Knight", traits: ["Assassin", "Brutalist"], role: "Frontline", notes: "Heavy disruptor and stall tank." },
  { name: "Archer Queen", traits: ["Clan", "Superstar"], role: "Backline", notes: "Top-end carry when protected." },
  { name: "Valkyrie", traits: ["Clan", "Ranger"], role: "Frontline", notes: "Solid anti-swarm frontliner." },
  { name: "Prince", traits: ["Noble", "Executioner"], role: "Frontline", notes: "Single-target breaker." },
  { name: "Royal Ghost", traits: ["Undead", "Assassin"], role: "Utility", notes: "Backline threat + utility." },
  { name: "Witch", traits: ["Undead", "Superstar"], role: "Backline", notes: "Summons pressure and sustain." },
  { name: "Musketeer", traits: ["Noble", "Superstar"], role: "Backline", notes: "Reliable ranged DPS." },
  { name: "PEKKA", traits: ["P.E.K.K.A", "Brutalist"], role: "Frontline", notes: "High-cost late-game closer." },
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
      Musketeer: [
        { unit: "Archer Queen", score: 83, reason: "Upside carry to close rounds when dives connect." },
      ],
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
      Musketeer: [
        { unit: "Valkyrie", score: 80, reason: "Cheap stabilization line when econ path is under pressure." },
      ],
      Witch: [
        { unit: "Archer Queen", score: 78, reason: "High cap pivot after stabilizing economy." },
      ],
    },
  },
];

function getUnit(name: string) {
  return UNITS.find((unit) => unit.name === name);
}

export default function Home() {
  const [selectedTactic, setSelectedTactic] = useState<TacticId>("goblinTempo");
  const [roster, setRoster] = useState<string[]>([]);

  const tactic = useMemo(
    () => TACTIC_TREES.find((tree) => tree.id === selectedTactic) ?? TACTIC_TREES[0],
    [selectedTactic],
  );

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
    setRoster((previous) =>
      previous.includes(name) ? previous.filter((unit) => unit !== name) : [...previous, name],
    );
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
          <h2 className="text-lg font-semibold">2) Select current roster</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {UNITS.map((unit) => {
              const selected = roster.includes(unit.name);
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
                    <span className="text-xs text-slate-400">{unit.role}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Traits: {unit.traits.join(" + ")}</p>
                  <p className="mt-2 text-sm text-slate-300">{unit.notes}</p>
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
                    Source node: {choice.parent} • Traits: {unit?.traits.join(" + ") ?? "Unknown"}
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
