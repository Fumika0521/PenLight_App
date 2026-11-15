import React, { useRef, useState, useEffect } from 'react';
import { PenlightConfig } from '../../types';

interface PenlightBaseProps {
  config: PenlightConfig;
  className?: string;
  showInsidePhoto?: boolean;
  showGloss?: boolean;
  showEmptyGlass?: boolean;
  /**
   * Container width / height ratio.
   * When provided for classic / heart2, the head–handle boundary mask
   * percentage is computed from the actual pixel row in the image (408 / 1024)
   * rather than using the hardcoded work-screen default.
   * Example: home screen hero area ≈ 400 × 508 → containerAspect={400/508}
   */
  containerAspect?: number;
}

// ドームヘッド部分の拡大率と変換基準点
export const HEAD_SCALE = 1.15;
export const HEAD_ORIGIN = '50% 43.9%';

const BASE_IMAGES: Record<string, string> = {
  classic: '/assets/hires/penlight_empty.png',
  heart2: '/assets/hires/penlight_heart2_realistic.png',
  panel: '/assets/hires/penlight_panel_realistic.png',
  wand: '/assets/hires/penlight_wand.svg',
};

/** 408px out of 1024px image height = head/handle boundary for classic & heart2 */
function classicCutoffPct(aspect: number): number {
  const topOffset = aspect < 1 ? (1 - aspect) / 2 : 0;
  return (topOffset + (408 / 1024) * Math.min(aspect, 1)) * 100;
}

export const PenlightBase: React.FC<PenlightBaseProps> = ({
  config,
  className = 'w-full h-full',
  showInsidePhoto = true,
  showGloss = false,
  showEmptyGlass = false,
  containerAspect,
}) => {
  // Measure actual container W/H — needed for both mask alignment and glow positioning
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{w: number; h: number} | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (height > 0)
        setContainerSize(prev =>
          prev && Math.abs(prev.w - width) < 0.5 && Math.abs(prev.h - height) < 0.5
            ? prev
            : { w: width, h: height }
        );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Prefer measured value, fall back to prop, then fall back to defaults below
  const measuredAspect = containerSize ? containerSize.w / containerSize.h : null;
  const effectiveAspect = measuredAspect ?? containerAspect;

  const {
    baseType,
    glowColor,
    glowIntensity,
    isLightOn,
    glowMode,
    insidePhotoUrl,
  } = config;

  const imageSrc = BASE_IMAGES[baseType] || BASE_IMAGES.classic;

  // Head mask cutoff percentage (stops exactly at the collar / neck)
  let headCutoff = '43.8%';
  let headFade = '44.1%';
  // Numeric Y% for transform-origin; default matches exported HEAD_ORIGIN ('50% 43.9%')
  let headOriginY = 43.9;

  if (baseType === 'heart2') {
    headCutoff = '43.8%';
    headFade = '44.1%';
  } else if (baseType === 'panel') {
    headCutoff = '45%';
    headFade = '48%';
  } else if (baseType === 'wand') {
    headCutoff = '38%';
    headFade = '42%';
  }

  // Dynamically compute the boundary % from the measured (or provided) container aspect.
  // Falls back to the type-specific defaults above when no size is known yet.
  if (effectiveAspect !== undefined && (baseType === 'classic' || baseType === 'heart2')) {
    const pct = classicCutoffPct(effectiveAspect);
    headCutoff  = `${pct.toFixed(1)}%`;
    headFade    = `${(pct + 0.3).toFixed(1)}%`;
    headOriginY = pct + 0.15;
  }

  // Local transform-origin derived above (the exported HEAD_ORIGIN constant is
  // kept for use in InteractiveCanvas which has its own fixed 380×620 canvas).
  const headOrigin = `50% ${headOriginY.toFixed(2)}%`;
  const headMask = `linear-gradient(to bottom, black 0%, black ${headCutoff}, transparent ${headFade})`;
  const headTransform = `scale(${HEAD_SCALE})`;

  // Collar band top (row 368px = where the wavy collar/ring starts in penlight_empty.png 1024×1024)
  // Same formula as classicCutoffPct but for row 368 instead of 408.
  let collarTopY = 41.3; // default for work canvas aspect ~0.613
  if (effectiveAspect !== undefined && (baseType === 'classic' || baseType === 'heart2')) {
    const topOffset = effectiveAspect < 1 ? (1 - effectiveAspect) / 2 : 0;
    collarTopY = (topOffset + (368 / 1024) * Math.min(effectiveAspect, 1)) * 100;
  }

  // Mask that shows only the wavy collar/ring band (between row 368 and the head/handle boundary).
  // Used to place opaque layers on top of the glow so it cannot bleed through semi-transparent pixels.
  const collarBandMask = `linear-gradient(to bottom, transparent 0%, transparent ${(collarTopY - 0.3).toFixed(1)}%, black ${collarTopY.toFixed(1)}%, black ${headCutoff}, transparent ${headFade})`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none pointer-events-none transition-all duration-300 ${className}`}
    >
      {/* 1. Main 3D Penlight — unscaled, handle only (inverse mask hides head to prevent seam) */}
      <img
        src={imageSrc}
        alt={`Penlight ${baseType}`}
        className="absolute inset-0 z-[5] w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_22px_rgba(0,0,0,0.1)]"
        style={{
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, transparent ${headCutoff}, black ${headFade})`,
          maskImage: `linear-gradient(to bottom, transparent 0%, transparent ${headCutoff}, black ${headFade})`,
        }}
      />

      {/* 2. Head Glow — scaled from neck origin */}
      {isLightOn && (
        <div
          className={`absolute inset-0 z-[10] pointer-events-none transition-all duration-300 ${
            glowMode === 'pulse' ? 'animate-pulse' : ''
          }`}
          style={{
            transform: headTransform,
            transformOrigin: headOrigin,
            filter: `drop-shadow(0 0 ${6 * glowIntensity}px ${glowColor}) drop-shadow(0 0 ${
              18 * glowIntensity
            }px ${glowColor}) drop-shadow(0 0 ${34 * glowIntensity}px ${glowColor}cc) drop-shadow(0 0 ${
              54 * glowIntensity
            }px ${glowColor}66) drop-shadow(0 0 ${
              76 * glowIntensity
            }px ${glowColor}25)`,
          }}
        >
          <div
            className="w-full h-full pointer-events-none"
            style={{
              WebkitMaskImage: headMask,
              maskImage: headMask,
            }}
          >
            <img
              src={imageSrc}
              alt=""
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* 2.1 Collar white plate — solid white behind collar pixels, blocks glow bleed */}
      {(baseType === 'classic' || baseType === 'heart2') && (
        <div
          className="absolute inset-0 z-[12] pointer-events-none"
          style={{
            transform: headTransform,
            transformOrigin: headOrigin,
            WebkitMaskImage: collarBandMask,
            maskImage: collarBandMask,
          }}
        >
          <img
            src={imageSrc}
            alt=""
            className="w-full h-full object-contain pointer-events-none"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
      )}

      {/* 2.2 Collar image copy — renders actual collar pixels above white plate */}
      {(baseType === 'classic' || baseType === 'heart2') && (
        <div
          className="absolute inset-0 z-[14] pointer-events-none"
          style={{
            transform: headTransform,
            transformOrigin: headOrigin,
            WebkitMaskImage: collarBandMask,
            maskImage: collarBandMask,
          }}
        >
          <img
            src={imageSrc}
            alt=""
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
      )}

      {/* 3. Scaled head image — covers unscaled head from layer 1, masked to head-only */}
      <div
        className="absolute inset-0 z-[20] pointer-events-none"
        style={{
          transform: headTransform,
          transformOrigin: headOrigin,
          WebkitMaskImage: headMask,
          maskImage: headMask,
        }}
      >
        <img
          src={imageSrc}
          alt=""
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* 4. Optional User Photo — scaled with head */}
      {showInsidePhoto && insidePhotoUrl && (
        <div
          className="absolute z-[25] pointer-events-none transition-all duration-300 overflow-hidden flex items-center justify-center shadow-sm"
          style={{
            top: baseType === 'wand' ? '20%' : '24%',
            left: '50%',
            transform: `translate(-50%, -50%) ${headTransform}`,
            transformOrigin: headOrigin,
            width: '28%',
            height: '28%',
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: `0 0 6px ${glowColor}88`,
          }}
        >
          <img
            src={insidePhotoUrl}
            alt="inside oshi avatar"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 4.5. Empty Glass Insert — shown on home screen when no insert is selected */}
      {/* Uses a 1:1 coordinate layer matching the penlight image so position is
          container-aspect-ratio independent. Size and clip-path are matched to the
          work-screen insert ratio (insert clip radius ≈ dome inner radius). */}
      {baseType === 'classic' && showEmptyGlass && (
        <div className="absolute inset-0 z-[23] pointer-events-none flex items-center justify-center">
          <div className="relative" style={{ width: '100%', aspectRatio: '1 / 1', maxHeight: '100%' }}>
            <div
              className="absolute"
              style={{
                top: '23.3%',
                left: '50%',
                width: '34.2%',
                aspectRatio: '304 / 260',
                transform: `translate(-50%, -50%) ${headTransform}`,
                transformOrigin: headOrigin,
              }}
            >
              <img
                src="/assets/stickers/insert_empty_glass.png"
                alt=""
                className="w-full h-full object-contain pointer-events-none select-none"
                style={{
                  clipPath: 'ellipse(48% 56% at 50% 49%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 10%, black 26%)',
                  maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 10%, black 26%)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4.6. Collar overlay — lower penlight (handle + wavy collar) rendered above
          the insert so insert content cannot bleed below the head/handle boundary.
          Uses the same headCutoff/headFade as the main layers (may be dynamic when
          containerAspect is provided). No scale transform — handle is unscaled. */}
      {baseType === 'classic' && showEmptyGlass && (
        <div
          className="absolute inset-0 z-[24] pointer-events-none"
          style={{
            WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, transparent ${headCutoff}, black ${headFade})`,
            maskImage: `linear-gradient(to bottom, transparent 0%, transparent ${headCutoff}, black ${headFade})`,
          }}
        >
          <img
            src={imageSrc}
            alt=""
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
      )}

      {/* 5. Optional Dome Gloss — scaled with head */}
      {showGloss && baseType === 'classic' && (
        <img
          src="/assets/hires/dome_gloss.png"
          alt="Glass Dome Gloss"
          className="absolute inset-0 z-[30] w-full h-full object-contain pointer-events-none select-none"
          style={{
            transform: headTransform,
            transformOrigin: headOrigin,
          }}
        />
      )}
    </div>
  );
};
