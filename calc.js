const primaryValues = {
  bottle: 900_000,
  necklace: 1_000_000,
  bonds: 1_100_000,
  diamond: 1_300_000,
  panther: 1_900_000
}

const secondaryValues = {
  cash: {
    pctPerStack: 1 / 4,
    dollarPerStack: 90_000,
    clicksPerStack: 10
  },
  art: {
    pctPerStack: 1 / 2,
    dollarPerStack: 192_000,
    clicksPerStack: 1
  },
  gold: {
    pctPerStack: 2 / 3,
    dollarPerStack: 325_000,
    clicksPerStack: 7
  }
}

const hardMultiplier = 1.1


function calc() {
  const isHard = document.getElementById("hardMode").checked
  const primaryIndex = document.getElementById("primaryTarget").value
  const playerCount = document.getElementById("playerCount").textContent
  const cashCount = document.getElementById("secondaryInputCountCash").textContent
  const artCount = document.getElementById("secondaryInputCountArt").textContent
  const goldCount = document.getElementById("secondaryInputCountGold").textContent

  const primary = calcPrimary(primaryIndex, isHard)
  const secondary = calcSecondary(playerCount, cashCount, artCount, goldCount)

  document.getElementById("outputPrimaryWorth").textContent = `$${Number(primary).toLocaleString()}`
  document.getElementById("outputSecondaryWorth").textContent = `$${Number(secondary.amount).toLocaleString()}`
  document.getElementById("outputTotalWorth").textContent = `$${Number(primary + secondary.amount).toLocaleString()}`

  document.getElementById("outputCashPiles").textContent = Number(secondary.cashCount).toLocaleString()
  document.getElementById("outputCashClicks").textContent = Number(secondary.cashClicks).toLocaleString()

  document.getElementById("outputArtPiles").textContent = Number(secondary.artCount).toLocaleString()
  document.getElementById("outputArtClicks").textContent = Number(secondary.artClicks).toLocaleString()

  document.getElementById("outputGoldPiles").textContent = Number(secondary.goldCount).toLocaleString()
  document.getElementById("outputGoldClicks").textContent = Number(secondary.goldClicks).toLocaleString()
}

function calcPrimary(primaryIndex, isHard) {
  return Math.round(primaryValues[primaryIndex] * (isHard ? hardMultiplier : 1))
}

function calcSecondary(bagSpacePct, cashCount, artCount, goldCount) {
  let cashClicks = cashCount * secondaryValues["cash"].clicksPerStack
  let artClicks = artCount * secondaryValues["art"].clicksPerStack
  let goldClicks = goldCount * secondaryValues["gold"].clicksPerStack

  let max = {
    amount: 0,
    bagSpaceUsed: 0,
    goldClicks: 0,
    artClicks: 0,
    cashClicks: 0
  }

  for (let iG = 0; iG <= goldClicks; iG++) {
    for (let iA = 0; iA <= artClicks; iA++) {
      for (let iC = 0; iC <= cashClicks; iC++) {
        let {payout, bagSpaceUsed} = calcSecondaryPayout(iC, iA, iG)
        if (payout > max.amount && bagSpaceUsed - bagSpacePct < 0.001) {
          max = {
            amount: payout,
            bagSpaceUsed: bagSpaceUsed,
            goldClicks: iG,
            artClicks: iA,
            cashClicks: iC,
          }
        }
      }
    }
  }
  return {
    amount: Math.round(max.amount),
    bagSpaceUsed: max.bagSpaceUsed,
    cashCount: max.cashClicks / secondaryValues["cash"].clicksPerStack,
    cashClicks: max.cashClicks,
    artCount: max.artClicks / secondaryValues["art"].clicksPerStack,
    artClicks: max.artClicks,
    goldCount: max.goldClicks / secondaryValues["gold"].clicksPerStack,
    goldClicks: max.goldClicks
  }
}

function calcSecondaryPayout(cashClicks, artClicks, goldClicks) {
  let payout = 0
  payout += cashClicks * (secondaryValues["cash"].dollarPerStack / secondaryValues["cash"].clicksPerStack)
  payout += artClicks * (secondaryValues["art"].dollarPerStack / secondaryValues["art"].clicksPerStack)
  payout += goldClicks * (secondaryValues["gold"].dollarPerStack / secondaryValues["gold"].clicksPerStack)
  let bagSpaceUsed = 0
  bagSpaceUsed += cashClicks / secondaryValues["cash"].clicksPerStack * secondaryValues["cash"].pctPerStack
  bagSpaceUsed += artClicks / secondaryValues["art"].clicksPerStack * secondaryValues["art"].pctPerStack
  bagSpaceUsed += goldClicks / secondaryValues["gold"].clicksPerStack * secondaryValues["gold"].pctPerStack
  return {payout, bagSpaceUsed}
}

function updateSecondaryInputCount(inputName, amount, min, max) {
  let input = document.getElementById(inputName)
  input.textContent = Math.min(max, Math.max(min, Number(input.textContent) + amount)) + ""
  calc()
}


