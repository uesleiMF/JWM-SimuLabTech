/**
 * Sons do laboratório (Web Audio API — sem arquivos externos).
 * Motor, botoeiras, contator, interruptor, fusível, relé, etc.
 */

let audioCtx = null;
let masterGain = null;
let muted = false;
let motorOsc = null;
let motorGain = null;
let motorRunning = false;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = muted ? 0 : 0.35;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundMuted(value) {
  muted = Boolean(value);
  if (masterGain) {
    masterGain.gain.setTargetAtTime(
      muted ? 0 : 0.35,
      getCtx()?.currentTime || 0,
      0.02
    );
  }
}

export function isSoundMuted() {
  return muted;
}

function beep({
  freq = 440,
  duration = 0.08,
  type = "square",
  volume = 0.25,
  freqEnd = null,
}) {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx || !masterGain) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (freqEnd != null) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(freqEnd, 20),
      ctx.currentTime + duration
    );
  }

  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + duration
  );

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration + 0.02);
}

/** Clique curto (botoeira / interruptor) */
export function playClick(kind = "soft") {
  if (kind === "hard") {
    beep({ freq: 180, duration: 0.06, type: "square", volume: 0.3 });
    beep({ freq: 90, duration: 0.08, type: "triangle", volume: 0.2 });
  } else if (kind === "release") {
    beep({ freq: 220, duration: 0.04, type: "triangle", volume: 0.12 });
  } else {
    beep({ freq: 900, duration: 0.035, type: "square", volume: 0.15 });
  }
}

/** Contator: "clac" ao fechar / abrir */
export function playContactor(closing = true) {
  if (closing) {
    beep({ freq: 120, duration: 0.07, type: "square", volume: 0.35 });
    setTimeout(
      () => beep({ freq: 80, duration: 0.05, type: "triangle", volume: 0.2 }),
      30
    );
  } else {
    beep({ freq: 100, duration: 0.05, type: "triangle", volume: 0.2 });
  }
}

/** Fusível queima */
export function playFuseBlow() {
  beep({
    freq: 400,
    freqEnd: 60,
    duration: 0.35,
    type: "sawtooth",
    volume: 0.3,
  });
}

/** Relé / disjuntor desarma */
export function playTrip() {
  beep({ freq: 300, duration: 0.1, type: "square", volume: 0.25 });
  setTimeout(
    () => beep({ freq: 180, duration: 0.12, type: "square", volume: 0.2 }),
    80
  );
}

/** Alerta de sobrecarga (bip curto) */
export function playOverloadBeep() {
  beep({ freq: 880, duration: 0.12, type: "square", volume: 0.12 });
}

/** Motor: zumbido contínuo enquanto FUNCIONANDO */
export function startMotorSound() {
  if (muted || motorRunning) return;
  const ctx = getCtx();
  if (!ctx || !masterGain) return;

  motorOsc = ctx.createOscillator();
  motorGain = ctx.createGain();
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();

  motorOsc.type = "sawtooth";
  motorOsc.frequency.setValueAtTime(55, ctx.currentTime);
  motorGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  motorGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.15);

  osc2.type = "square";
  osc2.frequency.setValueAtTime(110, ctx.currentTime);
  gain2.gain.setValueAtTime(0.02, ctx.currentTime);

  motorOsc.connect(motorGain);
  motorGain.connect(masterGain);
  osc2.connect(gain2);
  gain2.connect(masterGain);

  motorOsc.start();
  osc2.start();

  // guarda segundo oscilador no nó principal para parar junto
  motorOsc._buddy = osc2;
  motorOsc._buddyGain = gain2;
  motorRunning = true;
}

export function stopMotorSound() {
  if (!motorRunning) return;
  const ctx = getCtx();
  try {
    if (motorGain && ctx) {
      motorGain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + 0.12
      );
    }
    const osc = motorOsc;
    const buddy = motorOsc?._buddy;
    setTimeout(() => {
      try {
        osc?.stop();
        buddy?.stop();
      } catch {
        /* already stopped */
      }
    }, 150);
  } catch {
    /* ignore */
  }
  motorOsc = null;
  motorGain = null;
  motorRunning = false;
}

export function isMotorSoundRunning() {
  return motorRunning;
}

/**
 * Compara estado anterior x atual e dispara os sons certos.
 * Chamar em useEffect quando simulation / circuit mudarem.
 */
export function syncCircuitSounds(prev, next) {
  if (!next) return;

  const prevComps = prev?.components || [];
  const nextComps = next.components || [];
  const prevById = Object.fromEntries(
    prevComps.map((c) => [c.id, c])
  );

  nextComps.forEach((comp) => {
    const before = prevById[comp.id];
    if (!before) return;

    // Botoeira / interruptor
    if (
      [
        "switch",
        "push_button_no",
        "push_button_nc",
      ].includes(comp.type)
    ) {
      if (Boolean(before.value) !== Boolean(comp.value)) {
        if (comp.type === "push_button_no") {
          playClick(comp.value ? "hard" : "release");
        } else if (comp.type === "push_button_nc") {
          playClick(comp.value ? "release" : "hard");
        } else {
          playClick(comp.value ? "hard" : "soft");
        }
      }
    }

    // Contator (por bobina / value)
    if (comp.type === "contactor") {
      const wasOn = Boolean(before._coilOn ?? before.value);
      const isOn = Boolean(comp._coilOn ?? comp.value);
      if (wasOn !== isOn) {
        playContactor(isOn);
      }
    }

    // Proteções
    if (
      ["fuse_isolator", "thermal_relay", "breaker"].includes(
        comp.type
      )
    ) {
      if (!before.burned && comp.burned) {
        playFuseBlow();
      } else if (!before.tripped && comp.tripped) {
        playTrip();
      }
    }
  });

  // Motor(es) energizados
  const anyMotorOn = (next.simulationLoads || []).some(
    (l) => l.type === "motor" && l.energized
  );
  // fallback: next.energizedMotorIds
  const motorIds = next.energizedMotorIds;
  const motorsRunning =
    anyMotorOn ||
    (Array.isArray(motorIds) && motorIds.length > 0);

  if (motorsRunning) {
    startMotorSound();
  } else {
    stopMotorSound();
  }
}
