import data from './data.json';

const BAG_CAPACITY = data.bag_capacity || 1800;
const VALUE_PRIORITY = ['gold', 'cocaine', 'weed', 'paintings', 'cash'] as const;

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
    units: number;
    value: number;
    bags: number;
    presses: number;
  }>;
}

type TargetType = (typeof VALUE_PRIORITY)[number];

function getAverage(min: number, max: number): number {
  return (min + max) / 2;
}

function getTargetData(targetType: TargetType) {
  const target = data.targets.secondary.find((item) => item.name === targetType);
  if (!target) {
    return null;
  }

  return {
    pickupUnits: target.pickup_units,
    fullTableUnits: target.full_table_units,
    minValue: target.value.min,
    maxValue: target.value.max,
  };
}

function calculateLootForTarget(
  targetType: TargetType,
  availableTables: number,
  remainingCapacity: number,
  allowOverfill = false,
): { units: number; presses: number; tablesUsed: number } {
  if (remainingCapacity <= 0 || availableTables <= 0) {
    return { units: 0, presses: 0, tablesUsed: 0 };
  }

  const targetData = getTargetData(targetType);
  if (!targetData) {
    return { units: 0, presses: 0, tablesUsed: 0 };
  }

  const { pickupUnits, fullTableUnits } = targetData;

  let totalUnits = 0;
  let totalPresses = 0;
  let tablesUsed = 0;
  let capacityLeft = remainingCapacity;

  for (let tableIndex = 0; tableIndex < availableTables && capacityLeft > 0; tableIndex++) {
    if (targetType === 'paintings') {
      if (capacityLeft >= fullTableUnits) {
        totalUnits += fullTableUnits;
        totalPresses += 1;
        tablesUsed++;
        capacityLeft -= fullTableUnits;
      } else if (allowOverfill && capacityLeft > 0) {
        totalUnits += capacityLeft;
        totalPresses += 1;
        tablesUsed++;
        capacityLeft = 0;
      } else {
        break;
      }
    } else {
      let unitsFromThisTable = 0;
      let pressesForThisTable = 0;
      let lastPressOverfill = 0;

      for (let pickupIndex = 0; pickupIndex < pickupUnits.length; pickupIndex++) {
        const cumulativeUnits = pickupUnits[pickupIndex];
        if (cumulativeUnits <= capacityLeft) {
          unitsFromThisTable = cumulativeUnits;
          pressesForThisTable = pickupIndex + 1;
        } else {
          if (allowOverfill && pickupIndex === pressesForThisTable) {
            lastPressOverfill = cumulativeUnits;
          }
          break;
        }
      }

      if (unitsFromThisTable > 0) {
        totalUnits += unitsFromThisTable;
        totalPresses += pressesForThisTable;
        tablesUsed++;
        capacityLeft -= unitsFromThisTable;
      }

      if (capacityLeft > 0 && allowOverfill && lastPressOverfill > 0) {
        totalUnits += capacityLeft;
        totalPresses += 1;
        capacityLeft = 0;
      } else if (unitsFromThisTable === 0) {
        if (allowOverfill && capacityLeft > 0 && capacityLeft < pickupUnits[0]) {
          totalUnits += capacityLeft;
          totalPresses += 1;
          capacityLeft = 0;
        }
        break;
      }
    }
  }

  return { units: totalUnits, presses: totalPresses, tablesUsed };
}

export function calculateLoot(settings: Settings): LootResult {
  const players = settings.players;
  const totalCapacity = players * BAG_CAPACITY;
  let remainingCapacity = totalCapacity;

  const isHardMode = settings.hardMode ? 'hard' : 'standard';
  const primaryTargetData = data.targets.primary.find((target) => target.name === settings.primaryTarget);
  if (!primaryTargetData) {
    return getEmptyResult(totalCapacity);
  }

  const withinCooldownBonus = settings.withinCooldown ? primaryTargetData.bonus_multiplier : 1;

  const results: LootResult['results'] = [];
  let totalSecondaryValue = 0;

  for (const targetType of VALUE_PRIORITY) {
    if (remainingCapacity <= 0) {
      break;
    }
    if (targetType === 'cash') {
      continue;
    }

    const availableTables = settings.tables[targetType] || 0;
    if (availableTables <= 0) {
      continue;
    }

    if (targetType === 'gold' && players === 1 && !settings.goldAlone) {
      continue;
    }

    const targetData = getTargetData(targetType);
    if (!targetData) {
      continue;
    }

    if (targetType === 'paintings' && remainingCapacity < targetData.fullTableUnits) {
      continue;
    }

    const allowOverfill = targetType !== 'paintings';
    const lootResult = calculateLootForTarget(targetType, availableTables, remainingCapacity, allowOverfill);

    if (lootResult.units > 0) {
      const bagsFilled = lootResult.units / BAG_CAPACITY;
      const avgValue = getAverage(targetData.minValue, targetData.maxValue);
      const valueCollected = (lootResult.units / targetData.fullTableUnits) * avgValue * withinCooldownBonus;

      results.push({
        name: targetType,
        units: lootResult.units,
        bags: bagsFilled,
        presses: lootResult.presses,
        value: valueCollected,
      });

      totalSecondaryValue += valueCollected;
      remainingCapacity -= lootResult.units;
    }
  }

  if (remainingCapacity > 0) {
    const cashAvailable = settings.tables.cash || 0;
    if (cashAvailable > 0) {
      const targetData = getTargetData('cash');
      if (targetData) {
        const lootResult = calculateLootForTarget('cash', cashAvailable, remainingCapacity, true);

        if (lootResult.units > 0) {
          const bagsFilled = lootResult.units / BAG_CAPACITY;
          const avgValue = getAverage(targetData.minValue, targetData.maxValue);
          const valueCollected = (lootResult.units / targetData.fullTableUnits) * avgValue * withinCooldownBonus;

          results.push({
            name: 'cash',
            units: lootResult.units,
            bags: bagsFilled,
            presses: lootResult.presses,
            value: valueCollected,
          });

          totalSecondaryValue += valueCollected;
          remainingCapacity -= lootResult.units;
        }
      }
    }
  }

  const primaryValue = primaryTargetData.value[isHardMode];
  const totalLootValue = (totalSecondaryValue + primaryValue) * data.events_multiplier;
  const officeSafeAvg = getAverage(data.targets.office_safe.min, data.targets.office_safe.max);

  const fencingFee = totalLootValue * 0.1;
  const pavelCut = totalLootValue * 0.02;
  const eliteChallenge = data.elite_challenge[isHardMode];

  const finalPayout = totalLootValue + officeSafeAvg - fencingFee - pavelCut;

  return {
    results,
    totalLootValue,
    finalPayout,
    fees: {
      fencing: fencingFee,
      pavel: pavelCut,
    },
    officeSafe: officeSafeAvg,
    eliteChallenge,
    primaryValue,
    totalSecondaryValue,
    remainingCapacity,
    totalCapacity,
  };
}

export function calculateMaxPotential(settings: Settings): LootResult {
  const perfectSettings: Settings = {
    ...settings,
    tables: {
      gold: 10,
      cocaine: 10,
      weed: 10,
      paintings: 10,
      cash: 10,
    },
  };

  return calculateLoot(perfectSettings);
}

function getEmptyResult(totalCapacity: number): LootResult {
  return {
    results: [],
    totalLootValue: 0,
    finalPayout: 0,
    fees: {
      fencing: 0,
      pavel: 0,
    },
    officeSafe: 0,
    eliteChallenge: 0,
    primaryValue: 0,
    totalSecondaryValue: 0,
    remainingCapacity: totalCapacity,
    totalCapacity,
  };
}
