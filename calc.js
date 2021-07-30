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
    dollarPerStack: 89_420,
    clicksPerStack: 10
  },
  art: {
    pctPerStack: 1 / 2,
    dollarPerStack: 199_700,
    clicksPerStack: 1
  },
  gold: {
    pctPerStack: 2 / 3,
    dollarPerStack: 333_192,
    clicksPerStack: 7
  },
  cocaine: {
    pctPerStack: 1 / 2,
    dollarPerStack: 220_500,
    clicksPerStack: 10
  },
  weed: {
    pctPerStack: 1 / 3,
    dollarPerStack: 110_000,
    clicksPerStack: 149_265
  }
}

const hardMultiplier = 1.1
const fencingFeePct = 0.1
const pavelFeePct = 0.02

function calc() {
  const isHard = document.getElementById("hardMode").checked
  const primaryIndex = document.getElementById("primaryTarget").value
  const playerCount = document.getElementById("playerCount").textContent
  const cashCount = document.getElementById("secondaryInputCountCash").textContent
  const artCount = document.getElementById("secondaryInputCountArt").textContent
  const goldCount = document.getElementById("secondaryInputCountGold").textContent
  const cocaineCount = document.getElementById("secondaryInputCountCocaine").textContent
  const weedCount = document.getElementById("secondaryInputCountWeed").textContent

  const primary = calcPrimary(primaryIndex, isHard)
  const secondary = calcSecondary(playerCount, cashCount, artCount, goldCount, cocaineCount, weedCount)

  let totalWorth = primary + secondary.amount

  let payoutTotal = totalWorth
  let fencingFee = totalWorth * fencingFeePct
  payoutTotal -= fencingFee
  let pavelFee = totalWorth * pavelFeePct
  payoutTotal -= pavelFee
  let payoutPerPerson = Math.round(payoutTotal / playerCount)

  updateLabel("outputPrimaryWorth", primary, true)
  updateLabel("outputSecondaryWorth", secondary.amount, true)
  updateLabel("outputTotalWorth", totalWorth, true)

  updateLabel("outputFencingFee", fencingFee, true)
  updateLabel("outputPavelFee", pavelFee, true)
  updateLabel("outputPayoutTotal", payoutTotal, true)
  updateLabel("outputPayoutPerPerson", payoutPerPerson, true)


  updateLabel("outputCashPiles", secondary.cashCount)
  updateLabel("outputCashClicks", secondary.cashClicks)

  updateLabel("outputArtPiles", secondary.artCount)
  updateLabel("outputArtClicks", secondary.artClicks)

  updateLabel("outputGoldPiles", secondary.goldCount)
  updateLabel("outputGoldClicks", secondary.goldClicks)

  updateLabel("outputCocainePiles", secondary.cocaineCount)
  updateLabel("outputCocaineClicks", secondary.cocaineClicks)

  updateLabel("outputWeedPiles", secondary.weedCount)
  updateLabel("outputWeedClicks", secondary.weedClicks)
}

function calcPrimary(primaryIndex, isHard) {
  return Math.round(primaryValues[primaryIndex] * (isHard ? hardMultiplier : 1))
}

function calcSecondary(bagSpacePct, cashCount, artCount, goldCount, cocaineCount, weedCount) {
  let cashClicks = cashCount * secondaryValues["cash"].clicksPerStack
  let artClicks = artCount * secondaryValues["art"].clicksPerStack
  let goldClicks = goldCount * secondaryValues["gold"].clicksPerStack
  let cocaineClicks = cocaineCount * secondaryValues["cocaine"].clicksPerStack
  let weedClicks = weedCount * secondaryValues["weed"].clicksPerStack

  let max = {
    amount: 0,
    bagSpaceUsed: 0,
    goldClicks: 0,
    artClicks: 0,
    cashClicks: 0,
    cocaineClicks: 0,
    weedClicks: 0
  }

  for (let iGold = 0; iGold <= goldClicks; iGold++) {
    for (let iArt = 0; iArt <= artClicks; iArt++) {
      for (let iCash = 0; iCash <= cashClicks; iCash++) {
        for (let iCocaine = 0; iCocaine <= cocaineClicks; iCocaine++) {
          for (let iWeed = 0; iWeed <= weedClicks; iWeed++) {
            let {payout, bagSpaceUsed} = calcSecondaryPayout(iCash, iArt, iGold, iCocaine, iWeed)
            if (payout > max.amount && bagSpaceUsed - bagSpacePct < 0.001) {
              max = {
                amount: payout,
                bagSpaceUsed: bagSpaceUsed,
                goldClicks: iGold,
                artClicks: iArt,
                cashClicks: iCash,
                cocaineClicks: iCocaine,
                weedClicks: iWeed
              }
            }
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
    goldClicks: max.goldClicks,

    cocaineCount: max.cocaineClicks / secondaryValues["cocaine"].clicksPerStack,
    cocaineClicks: max.cocaineClicks,

    weedCount: max.weedClicks / secondaryValues["weed"].clicksPerStack,
    weedClicks: max.weedClicks
  }
}

function calcSecondaryPayout(cashClicks, artClicks, goldClicks, cocaineClicks, weedClicks) {
  let payout = 0
  payout += cashClicks * (secondaryValues["cash"].dollarPerStack / secondaryValues["cash"].clicksPerStack)
  payout += artClicks * (secondaryValues["art"].dollarPerStack / secondaryValues["art"].clicksPerStack)
  payout += goldClicks * (secondaryValues["gold"].dollarPerStack / secondaryValues["gold"].clicksPerStack)
  payout += cocaineClicks * (secondaryValues["cocaine"].dollarPerStack / secondaryValues["cocaine"].clicksPerStack)
  payout += weedClicks * (secondaryValues["weed"].dollarPerStack / secondaryValues["weed"].clicksPerStack)
  let bagSpaceUsed = 0
  bagSpaceUsed += cashClicks / secondaryValues["cash"].clicksPerStack * secondaryValues["cash"].pctPerStack
  bagSpaceUsed += artClicks / secondaryValues["art"].clicksPerStack * secondaryValues["art"].pctPerStack
  bagSpaceUsed += goldClicks / secondaryValues["gold"].clicksPerStack * secondaryValues["gold"].pctPerStack
  bagSpaceUsed += cocaineClicks / secondaryValues["cocaine"].clicksPerStack * secondaryValues["cocaine"].pctPerStack
  bagSpaceUsed += weedClicks / secondaryValues["weed"].clicksPerStack * secondaryValues["weed"].pctPerStack
  return {payout, bagSpaceUsed}
}

function updateSecondaryInputCount(inputName, amount, min, max) {
  let input = document.getElementById(inputName)
  input.textContent = Math.min(max, Math.max(min, Number(input.textContent) + amount)) + ""
  calc()
}

function updateLabel(elementId, value, dollarSign = false) {
  document.getElementById(elementId).textContent = `${dollarSign ? "$" : ""}${Number(value).toLocaleString()}`
}


