// import { CompleteOffer } from "@mangrovedao/mgv";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { AxisBottom } from "@visx/axis";
import { scaleLinear } from "@visx/scale";
import useResizeObserver from "use-resize-observer";

interface Props {
  currentPrice: number;
  initialMin: number;
  initialMax: number;
  onMinChange?: (newMin: number) => void;
  onMaxChange?: (newMax: number) => void;
}

const height = 100;

const KandelPriceChart: React.FC<Props> = ({
  currentPrice,
  initialMin,
  initialMax,
  onMinChange,
  onMaxChange,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver<HTMLDivElement>({
    ref: containerRef,
  });

  const margin = { top: 10, bottom: 40 };
  const domainMin = Math.min(
    currentPrice * 0.5,
    initialMin ? initialMin * 0.8 : currentPrice * 0.5,
  );
  const domainMax = Math.max(
    currentPrice * 1.5,
    initialMax ? initialMax * 1.2 : currentPrice * 1.5,
  );

  // const [initialMin, setMinPrice] = useState(initialMin ?? domainMin);
  // const [initialMax, setMaxPrice] = useState(initialMax ?? domainMax);
  const dragging = useRef<"min" | "max" | null>(null);

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [domainMin, domainMax],
        range: [0, width],
        clamp: true,
      }),
    [width, domainMax, domainMin],
  );

  const onPointerMove = useCallback(
    (evt: PointerEvent) => {
      if (!dragging.current || !svgRef.current) return;
      // measure the SVG, not the wrapper
      const rect = svgRef.current.getBoundingClientRect();
      const px = evt.clientX - rect.left;
      const price = xScale.invert(px);

      if (dragging.current === "min") {
        const newMin = Math.min(Math.max(price, domainMin), currentPrice);
        // setMinPrice(newMin);
        onMinChange?.(newMin);
      } else {
        const newMax = Math.max(Math.min(price, domainMax), currentPrice);
        // setMaxPrice(newMax);
        onMaxChange?.(newMax);
      }
    },
    [domainMin, domainMax, currentPrice, onMinChange, onMaxChange, xScale],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove]);

  const startDrag = (which: "min" | "max") => () => {
    dragging.current = which;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const yTop = margin.top;
  const yBottom = height - margin.bottom;
  // const midY = (yTop + yBottom) / 2;
  const fmtPct = (p: number) =>
    (((p - currentPrice) / currentPrice) * 100).toFixed(1) + "%";

  return (
    <div ref={containerRef} style={{ width: "100%", height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ userSelect: "none" }}
      >
        {/* baseline */}
        <line
          x1={0}
          y1={yBottom}
          x2={width}
          y2={yBottom}
          stroke="#ddd"
          strokeWidth={2}
        />

        {/* current price */}
        <line
          x1={xScale(currentPrice)}
          y1={yTop}
          x2={xScale(currentPrice)}
          y2={yBottom}
          stroke="#888"
          strokeWidth={2}
        />

        {/* min line + handle + label */}
        <line
          x1={xScale(initialMin)}
          y1={yTop}
          x2={xScale(initialMin)}
          y2={yBottom}
          stroke="#e55353"
          strokeWidth={3}
        />
        <g transform={`translate(${xScale(initialMin)}, 10)`}>
          <rect
            x={-15}
            y={0}
            width={15}
            height={30}
            rx={2}
            fill="#e55353"
            style={{ cursor: "ew-resize" }}
            onPointerDown={startDrag("min")}
          />
        </g>
        <g transform={`translate(${xScale(initialMin)}, ${yBottom + 5})`}>
          <rect x={-50} y={0} width={100} height={20} rx={4} fill="#e55353" />
          <text x={0} y={15} fontSize={10} fill="#fff" textAnchor="middle">
            {initialMin.toFixed(2)} ({fmtPct(initialMin)})
          </text>
        </g>

        {/* max line + handle + label */}
        <line
          x1={xScale(initialMax)}
          y1={yTop}
          x2={xScale(initialMax)}
          y2={yBottom}
          stroke="#4caf50"
          strokeWidth={3}
        />
        <g transform={`translate(${xScale(initialMax)}, 10)`}>
          <rect
            x={0}
            y={0}
            width={15}
            height={30}
            rx={2}
            fill="#4caf50"
            style={{ cursor: "ew-resize" }}
            onPointerDown={startDrag("max")}
          />
        </g>
        <g transform={`translate(${xScale(initialMax)}, ${yBottom + 5})`}>
          <rect x={-50} y={0} width={100} height={20} rx={4} fill="#4caf50" />
          <text x={0} y={15} fontSize={10} fill="#fff" textAnchor="middle">
            {initialMax.toFixed(2)} (+{fmtPct(initialMax)})
          </text>
        </g>

        {/* bottom axis */}
        <AxisBottom
          scale={xScale}
          top={yBottom}
          tickFormat={(v) => v.toFixed(2)}
          tickLength={6}
          tickStroke="#ffffff"
          tickLabelProps={() => ({
            fill: "#fff",
            dy: 15,
            fontSize: 10,
            textAnchor: "middle",
          })}
        />
      </svg>
    </div>
  );
};

export default memo(KandelPriceChart);
