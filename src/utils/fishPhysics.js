/**
 * Physics and animation calculations for swimming fish in the single enlarged aquarium.
 * Clamps fish strictly within the visual water volume:
 * - minY = canvasHeight * 0.12 (submerged below surface)
 * - maxY = canvasHeight * 0.70 (above sandbed and crab)
 * - minX = canvasWidth * 0.04  (inside left glass border)
 * - maxX = canvasWidth * 0.96  (inside right glass border)
 */

export function getAquariumBounds(canvasWidth, canvasHeight, fishSize = 3) {
  const scale = Math.round(7 + (fishSize || 3) * 3.6)
  const marginX = Math.round(scale * 1.5)
  const marginY = Math.round(scale * 0.9)

  const minX = canvasWidth * 0.04 + marginX
  const maxX = Math.max(minX + 30, canvasWidth * 0.96 - marginX)
  const minY = canvasHeight * 0.12 + marginY
  const maxY = Math.max(minY + 30, canvasHeight * 0.70 - marginY)

  return { minX, maxX, minY, maxY }
}

export function createFishAnimState(fish, canvasWidth = 1000, canvasHeight = 600) {
  const volumeScale = Math.max(0.85, Math.min(1.4, canvasWidth / 900))
  const speedTier = fish.speed || 3
  const speedMultiplier = ((speedTier * 0.35 + 0.6) * volumeScale)
  const facingRight = fish.facing != null ? fish.facing > 0 : (Math.random() > 0.5)
  const vx = (facingRight ? 1 : -1) * (0.8 + Math.random() * 0.6) * speedMultiplier

  const { minX, maxX, minY, maxY } = getAquariumBounds(canvasWidth, canvasHeight, fish.size || 3)
  const xSpan = Math.max(20, maxX - minX)
  const ySpan = Math.max(20, maxY - minY)

  const initialX = fish.x != null
    ? Math.min(maxX, Math.max(minX, fish.x))
    : minX + Math.random() * xSpan

  const initialY = fish.y != null
    ? Math.min(maxY, Math.max(minY, fish.y))
    : minY + Math.random() * ySpan

  return {
    ...fish,
    id: fish.id,
    x: initialX,
    y: initialY,
    vx: vx,
    vy: (Math.random() - 0.5) * 0.4,
    facing: facingRight ? 1 : -1,
    facingRight: facingRight,
    targetVy: 0,
    swimPhase: Math.random() * Math.PI * 2,
    tailAngle: Math.random() * Math.PI * 2,
    swimSpeed: 0.08 + speedMultiplier * 0.04,
    opacity: 0,
    turnCooldown: 0,
  }
}

export function updateFishAnimState(state, arg2, arg3, arg4, arg5) {
  let fish = state
  let canvasWidth = 1000
  let canvasHeight = 600
  let dt = 1

  if (typeof arg2 === 'object' && arg2 !== null && !('w' in arg2)) {
    fish = arg2
    canvasWidth = arg3 || 1000
    canvasHeight = arg4 || 600
    dt = arg5 || 1
  } else {
    canvasWidth = arg2 || 1000
    canvasHeight = arg3 || 600
    dt = arg4 || 1
  }

  // Fade in on spawn
  if (state.opacity < 1) {
    state.opacity = Math.min(1, state.opacity + 0.05 * dt)
  }

  const { minX, maxX, minY, maxY } = getAquariumBounds(canvasWidth, canvasHeight, fish.size || 3)
  const volumeScale = Math.max(0.85, Math.min(1.4, canvasWidth / 900))
  const speedTier = fish.speed || 3
  const speedMultiplier = ((speedTier * 0.35 + 0.6) * volumeScale)

  // Sinusoidal tail waggle and vertical swim motion
  state.swimPhase = (state.swimPhase || 0) + (state.swimSpeed || 0.1) * dt
  state.tailAngle = (state.tailAngle || 0) + (0.16 + speedTier * 0.02) * dt
  const driftY = Math.sin(state.swimPhase) * 0.45 * dt

  // Occasional gentle wander
  if (Math.random() < 0.02 * dt) {
    state.targetVy = (Math.random() - 0.5) * 0.6
  }
  state.vy += ((state.targetVy || 0) - state.vy) * 0.05 * dt

  // Move
  state.x += (state.vx || 1.2) * dt
  state.y += (state.vy + driftY) * dt

  if (state.turnCooldown > 0) {
    state.turnCooldown -= dt
  }

  // Horizontal wall turnaround
  if (state.x <= minX) {
    state.x = minX
    state.vx = Math.abs(state.vx || 1.2)
    state.facingRight = true
    state.facing = 1
    state.turnCooldown = 25
  } else if (state.x >= maxX) {
    state.x = maxX
    state.vx = -Math.abs(state.vx || 1.2)
    state.facingRight = false
    state.facing = -1
    state.turnCooldown = 25
  }

  // Course reversal in open water
  if (state.turnCooldown <= 0 && Math.random() < 0.002 * dt) {
    state.vx = -state.vx
    state.facingRight = state.vx > 0
    state.facing = state.vx > 0 ? 1 : -1
    state.turnCooldown = 70
  }

  // Vertical boundary enforcement
  if (state.y <= minY) {
    state.y = minY
    state.vy = Math.abs(state.vy) * 0.8 + 0.25
    state.targetVy = 0.4
  } else if (state.y >= maxY) {
    state.y = maxY
    state.vy = -Math.abs(state.vy) * 0.8 - 0.25
    state.targetVy = -0.4
  }

  // Speed normalization
  const targetSpeed = Math.max(0.7, speedMultiplier)
  const currentSpeed = Math.abs(state.vx)
  if (currentSpeed < targetSpeed * 0.8 || currentSpeed > targetSpeed * 1.2) {
    const dir = state.vx >= 0 ? 1 : -1
    state.vx = dir * (currentSpeed + (targetSpeed - currentSpeed) * 0.05 * dt)
  }

  return state
}

export const updateFishPhysics = updateFishAnimState

export default {
  getAquariumBounds,
  createFishAnimState,
  updateFishAnimState,
  updateFishPhysics,
}
