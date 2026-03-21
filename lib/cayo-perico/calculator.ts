import data from './data.json';

export const targetsData = data;

export interface Settings {
  players: number;
  hardMode: boolean;
  withinCooldown: boolean;
  goldAlone: boolean;
  primaryTarget: string;
  tables: Record<string, number>;
  cuts: Record<string, number>;
}

interface LootResult {
  primaryValue: number;
  totalSecondaryValue: number;
  officeSafe: number;
  totalLootValue: number;
  totalCapacity: number;
  remainingCapacity: number;
  eliteChallenge: number;
  fees: {
    fencing: number;
    pavel: number;
  };
  finalPayout: number;
  results: Array<{
    name: string;
    value: number;
    bags: number;
    presses: number;
  }>;
}

export function calculateLoot(settings: Settings): LootResult {
  const primaryTarget = data.targets.primary.find((target) => target.name === settings.primaryTarget);
  if (!primaryTarget) {
    return getEmptyResult();
  }

  const primaryValue = primaryTarget.value[settings.hardMode ? 'hard' : 'standard'];
  const multiplier = settings.withinCooldown ? primaryTarget.bonus_multiplier : 1;

  let totalSecondaryValue = 0;
  const secondaryResults: Array<{
    name: string;
    value: number;
    bags: number;
    presses: number;
  }> = [];

  const secondaryTargets = data.targets.secondary.filter((target) => {
    if (target.name === 'gold' && settings.players === 1 && !settings.goldAlone) {
      return false;
    }
    return settings.tables[target.name] > 0;
  });

  for (const target of secondaryTargets) {
    const avgValue = ((target.value.min + target.value.max) / 2) * multiplier;
    const count = settings.tables[target.name];

    const bagsNeeded = (count * target.full_table_units) / data.bag_capacity;
    const itemsPerBag = data.bag_capacity / (target.full_table_units / target.pickup_units.length);

    let presses = 0;
    if (target.pickup_units.length <= 1) {
      presses = count;
    } else {
      presses = Math.ceil(count * itemsPerBag / target.pickup_units[Math.floor(target.pickup_units.length / 2)]);
    }

    const itemValue = avgValue * count;
    totalSecondaryValue += itemValue;

    secondaryResults.push({
      name: target.name,
      value: itemValue,
      bags: bagsNeeded,
      presses,
    });
  }

  const officeSafeAvg = (data.targets.office_safe.min + data.targets.office_safe.max) / 2;

  const totalLootValue = primaryValue + totalSecondaryValue;
  const grossTotal = totalLootValue + officeSafeAvg;

  const fencingFee = grossTotal * 0.1;
  const pavelCut = grossTotal * 0.02;
  const eliteChallenge = settings.hardMode ? data.elite_challenge.hard : data.elite_challenge.standard;

  const finalPayout = grossTotal - fencingFee - pavelCut;

  let usedCapacity = 0;
  for (const target of secondaryTargets) {
    const count = settings.tables[target.name];
    usedCapacity += count * target.full_table_units;
  }

  return {
    primaryValue,
    totalSecondaryValue,
    officeSafe: officeSafeAvg,
    totalLootValue,
    totalCapacity: data.bag_capacity * 2,
    remainingCapacity: data.bag_capacity * 2 - usedCapacity,
    eliteChallenge,
    fees: {
      fencing: fencingFee,
      pavel: pavelCut,
    },
    finalPayout,
    results: secondaryResults,
  };
}

export function calculateMaxPotential(settings: Settings): number {
  const maxedSettings = {
    ...settings,
    tables: {
      gold: settings.players === 1 && !settings.goldAlone ? 0 : 5,
      cocaine: 5,
      weed: 5,
      paintings: 5,
      cash: 5,
    },
  };

  const result = calculateLoot(maxedSettings);
  return result.finalPayout;
}

function getEmptyResult(): LootResult {
  return {
    primaryValue: 0,
    totalSecondaryValue: 0,
    officeSafe: 0,
    totalLootValue: 0,
    totalCapacity: data.bag_capacity * 2,
    remainingCapacity: data.bag_capacity * 2,
    eliteChallenge: 0,
    fees: {
      fencing: 0,
      pavel: 0,
    },
    finalPayout: 0,
    results: [],
  };
}
