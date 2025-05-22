import GaugeComponent from "react-gauge-component";

export function AnxietyGauge({ value }: { value: number }) {
  return (
    <GaugeComponent
      value={value}
      style={{ width: "130px", height: "100%" }}
      type="radial"
      labels={{
        valueLabel: {
          style: {
            fontSize: "44px",
            fill: "var(--foreground)",
            textShadow: "unset",
          },
        },
        tickLabels: {
          hideMinMax: true,
        },
      }}
      arc={{
        subArcs: [
          { color: "#fb2c36", length: 0.1 }, // Red for low values
          { color: "#fdc700", length: 0.2 },
          { color: "#fff200", length: 0.2 },
          { color: "#9FD835", length: 0.2 },
          { color: "#05df72", length: 0.4 },
        ],
        gradient: true,
        padding: 0.02,
        width: 0.3,
      }}
      pointer={{
        elastic: true,
        animationDelay: 0,
      }}
    />
  );
}
