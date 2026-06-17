/**
 * @typedef MNData
 * @prop {number} aws
 * @prop {number} hpy
 * @prop {number} nr
 * @prop {number} bd
 * @prop {number} awf
 */

const weights = {
  aws: 1,
  hpy: 1,
  nr: 1,
  bd: 2,
  awf: 3
}

const values = {
  aws: 100,
  hpy: 70,
  nr: 50,
  bd: 15,
  awf: 0
}

/**
 * Compute numerator
 * @param {number} amount
 * @param {number} weight
 * @param {number} value
 * @returns {number}
 */
function compute_numerator(amount, weight, value) {
  return amount * weight * value
}

/**
 * Compute denumerator
 * @param {number} amount
 * @param {number} weight
 */
function compute_denominator(amount, weight) {
  return compute_numerator(amount, weight, 1)
}

/**
 * Compute value and returns numerator and denumerator
 * @param {number} amount
 * @param {number} weight
 * @param {number} value
 * @returns {[number, number]}
 */
function compute_value(amount, weight, value) {
  return [compute_numerator(amount, weight, value), compute_denominator(amount, weight)]
}

/**
 *
 * @param {MNData} param0
 * @returns
 */
export function compute({ aws, hpy, nr, bd, awf}) {
  const data = {
    aws: compute_value(aws, weights.aws, values.aws),
    hpy: compute_value(hpy, weights.hpy, values.hpy),
    nr: compute_value(nr, weights.nr, values.nr),
    bd: compute_value(bd, weights.bd, values.bd),
    awf: compute_value(awf, weights.awf, values.awf),
  }
  const nominator = data.aws[0] + data.hpy[0] + data.nr[0] + data.bd[0] + data.awf[0]
  const denominator = data.aws[1] + data.hpy[1] + data.nr[1] + data.bd[1] + data.awf[1]
  // console.log(data, nominator, denominator)
  return {score: (nominator / denominator), detail: data}
}
