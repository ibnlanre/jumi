import { object } from "helpers/object";

interface ClickData {
  x: number;
  y: number;
}

type Segment = {
  positions: Set<number>;
  coldspots: Set<ClickData>;
  hotspots: Set<ClickData>;
  clicks: Set<ClickData>;
};

interface Threshold {
  hotspot: number;
  coldspot: number;
}

interface Tracking {
  scrolls: boolean;
  clicks: boolean;
  hotspots: boolean;
  coldspots: boolean;
}

type Metric = "clicks" | "coldspots" | "hotspots" | "scroll";
type Heatmap = Array<Metric>;

export class HeatmapTracker {
  private canvas: HTMLCanvasElement;

  private threshold: Threshold = {
    hotspot: 80,
    coldspot: 20,
  };

  private tracking: Tracking = {
    scrolls: true,
    clicks: true,
    hotspots: true,
    coldspots: true,
  };

  private segment: Segment = {
    positions: new Set(),
    coldspots: new Set(),
    hotspots: new Set(),
    clicks: new Set(),
  };

  constructor(config?: {
    threshold?: Partial<Threshold>;
    tracking?: Partial<Tracking>;
  }) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    const threshold = object.stripEmptyProperties({ ...config?.threshold });
    this.threshold = {
      ...this.threshold,
      ...threshold,
    };

    this.tracking = {
      ...this.tracking,
      ...config?.tracking,
    };
  }

  private trackClicks = () => {
    document.addEventListener("click", (event) => {
      const record = { x: event.clientX, y: event.clientY };
      const xPercentage = (record.x / this.canvas.width) * 100;

      if (this.tracking.clicks) {
        this.segment.clicks.add(record);
      }

      if (xPercentage >= this.threshold.hotspot) {
        if (this.tracking.hotspots) {
          this.segment.hotspots.add(record);
        }
      } else if (xPercentage <= this.threshold.coldspot) {
        if (this.tracking.coldspots) {
          this.segment.coldspots.add(record);
        }
      }
    });
  };

  private trackScrolls = () => {
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      const position = (scrollY / (scrollHeight - viewportHeight)) * 100;
      this.segment.positions.add(position);
    });
  };

  private heatmap = {
    clicks: (context: CanvasRenderingContext2D | null) => {
      this.segment.clicks.forEach((click) => {
        if (context !== null) {
          context.fillStyle = "yellow";
          context.globalAlpha = 0.6;
          context.beginPath();
          context.arc(click.x, click.y, 10, 0, Math.PI * 2);
          context.fill();
          context.closePath();
        }
      });
    },
    hotspots: (context: CanvasRenderingContext2D | null) => {
      this.segment.hotspots.forEach((click) => {
        if (context !== null) {
          context.fillStyle = "red";
          context.globalAlpha = 0.6;
          context.beginPath();
          context.arc(click.x, click.y, 10, 0, Math.PI * 2);
          context.fill();
          context.closePath();
        }
      });
    },
    coldspots: (context: CanvasRenderingContext2D | null) => {
      this.segment.coldspots.forEach((click) => {
        if (context !== null) {
          context.fillStyle = "blue";
          context.globalAlpha = 0.6;
          context.beginPath();
          context.arc(click.x, click.y, 10, 0, Math.PI * 2);
          context.fill();
          context.closePath();
        }
      });
    },
    scrolls: (context: CanvasRenderingContext2D | null) => {
      if (context !== null) {
        context.fillStyle = "rgba(255, 0, 0, 0.5)";
      }

      this.segment.positions.forEach((position) => {
        const x = (this.canvas.width / 100) * position;
        context?.fillRect(x, 0, 1, this.canvas.height);
      });
    },
  };

  private getContext = (canvas: HTMLCanvasElement) => {
    return canvas.getContext("2d");
  };

  track = () => {
    if (this.tracking.scrolls) this.trackScrolls();
    this.trackClicks();
  };

  draw = (
    canvas: HTMLCanvasElement = this.canvas,
    heatmap: Heatmap = ["clicks", "coldspots", "hotspots", "scroll"]
  ) => {
    const context = this.getContext(canvas);
    heatmap.forEach((metric) => {
      this.heatmap[metric](context);
      const set = this.segment[metric] as Set<number | ClickData>;
      set.clear();
    });
  };
}
